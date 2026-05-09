import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Seed Admin User
  const adminEmail = 'admin@company.com'
  const adminPassword = 'admin12345'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      employeeProfile: {
        create: {
          department: 'Management',
          position: 'System Administrator',
        },
      },
    },
  })

  console.log(`Admin User: ${admin.name} (${admin.email})`)

  // 2. Seed Default Routine Items
  const routines = [
    { key: 'MEETING', label: 'Toplantı' },
    { key: 'MENTOR_FORUM_CHECK', label: 'Mentor forum kontrol' },
    { key: 'MENTOR_COMMUNITY_CHECK', label: 'Mentor topluluk kontrol' },
    { key: 'MENTOR_LEARNING_SHARE', label: 'Mentor öğren paylaşımı' },
    { key: 'MENTOR_FORUM_SHARE', label: 'Mentor forum paylaşımı' },
    { key: 'MENTOR_PLUS_CARE', label: 'Mentor+ ilgilenme' },
  ]

  console.log('Seeding Routine Items...')

  for (let i = 0; i < routines.length; i++) {
    const item = routines[i]
    await prisma.routineItem.upsert({
      where: { key: item.key },
      update: {
        label: item.label,
        sortOrder: i,
        isActive: true,
      },
      create: {
        key: item.key,
        label: item.label,
        sortOrder: i,
        isActive: true,
      },
    })
  }

  console.log('Seed executed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
