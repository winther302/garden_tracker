import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// User registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error: any) {
    console.error('Error registering user:', error);
    if (error.code === 'P2002') { // Unique constraint violation
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all projects
app.get('/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
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
});

// Get a single project
app.get('/projects/:id', async (req, res) => {
  const { id } = req.params;
  const project = await prisma.project.findUnique({
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
});

// Create a new project
app.post('/projects', async (req, res) => {
  const { name } = req.body;
  const project = await prisma.project.create({ data: { name } });
  res.json(project);
});

// Create a new bed
app.post('/projects/:projectId/beds', async (req, res) => {
  const { projectId } = req.params;
  const { name, assignedToId, tasks } = req.body;
  const bed = await prisma.bed.create({
    data: {
      name,
      assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
      project: { connect: { id: Number(projectId) } },
      tasks: { connect: tasks.map((task: { id: number }) => ({ id: task.id })) },
    },
  });
  res.json(bed);
});

// Create a new task
app.post('/projects/:projectId/tasks', async (req, res) => {
  const { projectId } = req.params;
  const { name, dueDate, frequency } = req.body;
  const task = await prisma.task.create({
    data: {
      name,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      frequency,
      project: { connect: { id: Number(projectId) } },
    },
  });
  res.json(task);
});

// Mark task as done
app.post('/beds/:bedId/tasks/:taskId/done', async (req, res) => {
  const { bedId, taskId } = req.params;
  const completedTask = await prisma.completedTask.create({
    data: {
      bed: { connect: { id: Number(bedId) } },
      task: { connect: { id: Number(taskId) } },
      completedAt: new Date(),
    },
  });
  res.json(completedTask);
});

// Assign an existing task to a bed
app.post('/beds/:bedId/tasks', async (req, res) => {
  const { bedId } = req.params;
  const { taskId } = req.body;
  try {
    const bed = await prisma.bed.update({
      where: { id: Number(bedId) },
      data: {
        tasks: { connect: { id: Number(taskId) } },
      },
    });
    res.json(bed);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
