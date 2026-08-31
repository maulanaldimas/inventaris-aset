# ---------- Runtime ----------
FROM node:22-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --include=dev

# Application
COPY . .

# Generate Prisma client + production build
RUN npx prisma generate && npm run build

# Upload directory (dipasang sebagai volume saat runtime)
RUN mkdir -p /app/public/uploads

EXPOSE 3000

# Entrypoint: pastikan LF walaupun repo di-clone di Windows
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]
