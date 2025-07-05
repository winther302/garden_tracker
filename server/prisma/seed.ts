import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  // Create People
  const alice = await prisma.person.upsert({
    where: { name: 'Alice' },
    update: {},
    create: { name: 'Alice' },
  });
  const bob = await prisma.person.upsert({
    where: { name: 'Bob' },
    update: {},
    create: { name: 'Bob' },
  });

  // Create Projects
  const homeGarden = await prisma.project.upsert({
    where: { name: 'Home Garden' },
    update: {},
    create: {
      name: 'Home Garden',
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
      assignedToId: alice.id,
      projectId: homeGarden.id,
      tasks: { connect: [{ id: homeGarden.tasks[0].id }, { id: homeGarden.tasks[1].id }] },
    },
  });

  await prisma.bed.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Herb Garden',
      assignedToId: bob.id,
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
      assignedToId: alice.id,
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