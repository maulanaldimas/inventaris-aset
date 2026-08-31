const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const db = new PrismaClient()

async function main() {
    let company = await db.company.findFirst()
    if (!company) {
        company = await db.company.create({ data: { name: 'Perusahaan Saya' } })
        console.log(`Perusahaan dibuat: ${company.name}`)
    }

    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase()
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin12345'

    const existing = await db.profile.findUnique({ where: { email } })
    if (existing) {
        await db.profile.update({
            where: { id: existing.id },
            data: {
                passwordHash: await bcrypt.hash(password, 10),
                role: 'admin',
                companyId: existing.companyId || company.id,
            },
        })
        console.log(`Admin diperbarui: ${email}`)
        return
    }

    await db.profile.create({
        data: {
            id: crypto.randomUUID(),
            email,
            passwordHash: await bcrypt.hash(password, 10),
            fullName: 'Administrator',
            role: 'admin',
            companyId: company.id,
        },
    })
    console.log(`Admin dibuat: ${email} / ${password}`)
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
    .finally(() => db.$disconnect())
