import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Assuming user IDs 1 and 2 exist for demonstration
  const userIdAlice = 1; 
  const userIdBob = 2; 

  // Create Projects
  const homeGarden = await prisma.project.upsert({
    where: { name: 'Home Garden' },
    update: {},
    create: {
      name: 'Home Garden',
      users: { create: { userId: userIdAlice, role: 'ADMIN' } }, // Assign admin to project creator
      tasks: {
        create: [
          { name: 'Watering', frequency: 'daily' },
          { name: 'Weeding', frequency: 'weekly' },
          { name: 'Pest Control', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)) },
          { name: 'Harvesting', dueDate: new Date(new Date().setDate(new Date().getDate() + 14)) },
        ],
      },
    },
    include: { tasks: true },
  });

  const communityGarden = await prisma.project.upsert({
    where: { name: 'Community Garden' },
    update: {},
    create: {
      name: 'Community Garden',
      users: { create: { userId: userIdBob, role: 'ADMIN' } }, // Assign admin to project creator
      tasks: {
        create: [
          { name: 'Pruning', frequency: 'weekly' },
          { name: 'Fertilizing', dueDate: new Date(new Date().setDate(new Date().getDate() + 3)) },
        ],
      },
    },
    include: { tasks: true },
  });

  // Create Beds for Home Garden
  await prisma.bed.upsert({
    where: { id: 1 }, // Using a fixed ID for upsert, adjust if needed
    update: {},
    create: {
      name: 'Strawberry Patch',
      assignedToUserId: userIdAlice,
      projectId: homeGarden.id,
      tasks: { connect: [{ id: homeGarden.tasks[0].id }, { id: homeGarden.tasks[1].id }] },
    },
  });

  await prisma.bed.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Herb Garden',
      assignedToUserId: userIdBob,
      projectId: homeGarden.id,
      tasks: { connect: [{ id: homeGarden.tasks[0].id }, { id: homeGarden.tasks[2].id }] },
    },
  });

  // Create Beds for Community Garden
  await prisma.bed.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Tomato Bed',
      assignedToUserId: userIdAlice,
      projectId: communityGarden.id,
      tasks: { connect: [{ id: communityGarden.tasks[0].id }] },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });