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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("../generated/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.sendStatus(401); // No token
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403); // Invalid token
        req.userId = user.userId;
        next();
    });
};
const prisma = new prisma_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// User registration
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    }
    catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 'P2002') { // Unique constraint violation
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get all projects
app.get('/projects', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projects = yield prisma.project.findMany({
        include: {
            beds: {
                include: {
                    assignedTo: true,
                    completedTasks: {
                        include: {
                            task: true,
                        },
                    },
                    tasks: true,
                },
            },
            tasks: true,
        },
    });
    res.json(projects);
}));
// Get a single project
app.get('/projects/:id', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const project = yield prisma.project.findUnique({
        where: { id: Number(id) },
        include: {
            beds: {
                include: {
                    assignedTo: true,
                    completedTasks: {
                        include: {
                            task: true,
                        },
                    },
                    tasks: true,
                },
            },
            tasks: true,
        },
    });
    res.json(project);
}));
// Create a new project
app.post('/projects', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const project = yield prisma.project.create({ data: { name } });
    res.json(project);
}));
// Create a new bed
app.post('/projects/:projectId/beds', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { name, assignedToId, tasks } = req.body;
    const bed = yield prisma.bed.create({
        data: {
            name,
            assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
            project: { connect: { id: Number(projectId) } },
            tasks: { connect: tasks.map((task) => ({ id: task.id })) },
        },
    });
    res.json(bed);
}));
// Create a new task
app.post('/projects/:projectId/tasks', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { name, dueDate, frequency } = req.body;
    const task = yield prisma.task.create({
        data: {
            name,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            frequency,
            project: { connect: { id: Number(projectId) } },
        },
    });
    res.json(task);
}));
// Mark task as done
app.post('/beds/:bedId/tasks/:taskId/done', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bedId, taskId } = req.params;
    const completedTask = yield prisma.completedTask.create({
        data: {
            bed: { connect: { id: Number(bedId) } },
            task: { connect: { id: Number(taskId) } },
            completedAt: new Date(),
        },
    });
    res.json(completedTask);
}));
// Assign an existing task to a bed
app.post('/beds/:bedId/tasks', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bedId } = req.params;
    const { taskId } = req.body;
    try {
        const bed = yield prisma.bed.update({
            where: { id: Number(bedId) },
            data: {
                tasks: { connect: { id: Number(taskId) } },
            },
        });
        res.json(bed);
    }
    catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ error: 'Failed to assign task' });
    }
}));
// User login
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
