"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting seeding...');
        // Assuming user IDs 1 and 2 exist for demonstration
        const userIdAlice = 1;
        const userIdBob = 2;
        // Create Projects
        const homeGarden = yield prisma.project.upsert({
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
        const communityGarden = yield prisma.project.upsert({
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
        yield prisma.bed.upsert({
            where: { id: 1 }, // Using a fixed ID for upsert, adjust if needed
            update: {},
            create: {
                name: 'Strawberry Patch',
                assignedToUserId: userIdAlice,
                projectId: homeGarden.id,
                tasks: { connect: [{ id: homeGarden.tasks[0].id }, { id: homeGarden.tasks[1].id }] },
            },
        });
        yield prisma.bed.upsert({
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
        yield prisma.bed.upsert({
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
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
