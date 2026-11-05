import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data (be careful with this in production!)
  await prisma.comment.deleteMany()
  await prisma.timerSession.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sunhelp.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('✓ Created admin user:', admin.email)

  // Create manager user
  const managerPassword = await bcrypt.hash('Manager@123', 12)
  const manager = await prisma.user.create({
    data: {
      email: 'manager@sunhelp.com',
      name: 'Manager User',
      password: managerPassword,
      role: 'MANAGER',
      isActive: true,
    },
  })
  console.log('✓ Created manager user:', manager.email)

  // Create developer user
  const developerPassword = await bcrypt.hash('Developer@123', 12)
  const developer = await prisma.user.create({
    data: {
      email: 'developer@sunhelp.com',
      name: 'Developer User',
      password: developerPassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  })
  console.log('✓ Created developer user:', developer.email)

  // Create client user
  const clientPassword = await bcrypt.hash('Client@123', 12)
  const client = await prisma.user.create({
    data: {
      email: 'client@sunhelp.com',
      name: 'John Client',
      password: clientPassword,
      role: 'CLIENT',
      company: 'Acme Corp',
      address: '123 Business St',
      isActive: true,
    },
  })
  console.log('✓ Created client user:', client.email)

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'SP-0001',
      title: 'Fix login page styling',
      description: 'The login page CSS needs to be fixed for mobile responsiveness. The buttons are not aligned properly.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      complexity: 'SIMPLE',
      estimatedHours: 2,
      hourlyRate: 50,
      createdById: client.id,
      assignedToId: developer.id,
    },
  })
  console.log('✓ Created ticket:', ticket1.ticketNumber)

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'SP-0002',
      title: 'Implement user dashboard',
      description: 'Create a comprehensive user dashboard with charts and analytics showing user activity and ticket statistics.',
      priority: 'MEDIUM',
      status: 'NEW',
      complexity: 'COMPLEX',
      estimatedHours: 16,
      hourlyRate: 50,
      createdById: client.id,
    },
  })
  console.log('✓ Created ticket:', ticket2.ticketNumber)

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
