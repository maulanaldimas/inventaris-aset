#!/bin/sh
set -e

echo "==> Menjalankan migrasi database..."
attempt=0
until npx prisma migrate deploy; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
        echo "Database tidak terjangkau, menyerah." >&2
        exit 1
    fi
    echo "Database belum siap, mencoba lagi ($attempt/30)..."
    sleep 2
done

if [ "${SEED_ON_START:-true}" = "true" ]; then
    echo "==> Menyiapkan perusahaan & admin default (idempoten)..."
    node scripts/seed.js || true
fi

echo "==> Menjalankan aplikasi..."
exec "$@"
