import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a User
  const user = await prisma.user.upsert({
    where: { email: 'demo@bugtracker.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@bugtracker.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
  })

  // Create a Project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Revamping the main marketing website',
    },
  })

  // Create Issues
  await prisma.issue.createMany({
    data: [
      {
        title: 'Fix navigation menu on mobile',
        description: 'The hamburger menu does not open on iOS Safari.',
        status: 'TODO',
        priority: 'HIGH',
        projectId: project.id,
        assigneeId: user.id,
      },
      {
        title: 'Update color palette',
        description: 'Use the new brand colors provided by the design team.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId: project.id,
        assigneeId: user.id,
      },
      {
        title: 'Optimize hero images',
        description: 'Compress images to improve Lighthouse scores.',
        status: 'DONE',
        priority: 'LOW',
        projectId: project.id,
        assigneeId: user.id,
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
