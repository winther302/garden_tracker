import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

interface AuthRequest extends Request {
  userId?: number;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Authentication attempt. Auth Header:', authHeader);

  if (token == null) {
    console.log('Token is null or undefined. Sending 401.');
    return res.sendStatus(401); // No token
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('Token verification failed. Error:', err.message, 'Sending 403.');
      return res.sendStatus(403); // Invalid token
    }
    req.userId = user.userId;
    console.log('Token verified. User ID:', req.userId);
    next();
  });
};

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
app.get('/projects', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        beds: {
          include: {
            assignedTo: true, // Now includes the User model
            completedTasks: {
              include: {
                task: true,
              },
            },
            tasks: true,
          },
        },
        tasks: true,
        users: {
          include: {
            user: true, // Include the User model
          },
        },
      },
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single project
app.get('/projects/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: Number(id),
        users: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        beds: {
          include: {
            assignedTo: true, // Now includes the User model
            completedTasks: {
              include: {
                task: true,
              },
            },
            tasks: true,
          },
        },
        tasks: true,
        users: {
          include: {
            user: true, // Include the User model
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching single project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new project
app.post('/projects', authenticateToken, async (req: AuthRequest, res) => {
  const { name } = req.body;
  const userId = req.userId;

  console.log('Received request to create project:', { name, userId });

  if (!userId) {
    console.log('Unauthorized: userId is missing.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        users: {
          create: {
            userId: userId,
            role: "ADMIN", // Assign ADMIN role to the project creator
          },
        },
      },
    });
    console.log('Project created successfully:', project);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new bed
app.post('/projects/:projectId/beds', authenticateToken, async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { name, assignedToId, tasks } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify user has access to the project
    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
        users: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const bed = await prisma.bed.create({
            data: {
                name,
                assignedToUserId: assignedToId === undefined ? null : assignedToId,
                projectId: Number(projectId), // Use projectId directly
                tasks: { connect: tasks.map((task: { id: number }) => ({ id: task.id })) },
            },
        });
    res.status(201).json(bed);
  } catch (error) {
    console.error('Error creating bed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task
app.post('/projects/:projectId/tasks', authenticateToken, async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { name, dueDate, frequency } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify user has access to the project
    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
        users: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const task = await prisma.task.create({
      data: {
        name,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        frequency,
        project: { connect: { id: Number(projectId) } },
      },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark task as done
app.patch('/projects/:projectId/beds/:bedId/tasks/:taskId/done', authenticateToken, async (req: AuthRequest, res) => {
  const { projectId, bedId, taskId } = req.params;
  const userId = req.userId;

  console.log(`[TASK DONE] Request received for projectId: ${projectId}, bedId: ${bedId}, taskId: ${taskId}, userId: ${userId}`);

  if (!userId) {
    console.log('[TASK DONE] Unauthorized: userId is missing.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[TASK DONE] Verifying project and bed access...');
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      include: { users: true },
    });

    if (!project || !project.users.some(up => up.userId === userId)) {
      console.log(`[TASK DONE] Access denied or project not found for projectId: ${projectId}`);
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const bed = await prisma.bed.findUnique({
      where: { id: Number(bedId) },
    });

    if (!bed || bed.projectId !== Number(projectId)) {
      console.log(`[TASK DONE] Bed not found or does not belong to project for bedId: ${bedId}`);
      return res.status(404).json({ error: 'Bed not found or access denied' });
    }
    console.log('[TASK DONE] Project and bed access verified.');

    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isRecurrent = task.frequency && task.frequency.length > 0;

    console.log(`[TASK DONE] Task is recurrent: ${isRecurrent}`);

    const transactionOperations: Prisma.PrismaPromise<any>[] = [
      prisma.completedTask.create({
        data: {
          bed: { connect: { id: Number(bedId) } },
          task: { connect: { id: Number(taskId) } },
          completedAt: new Date(),
        },
      }),
    ];

    if (isRecurrent) {
      const calculateNextDueDate = (frequency: string, fromDate: Date): Date => {
        const nextDueDate = new Date(fromDate);
        switch (frequency.toLowerCase()) {
          case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
          default:
            return fromDate; // Or handle as an error
        }
        return nextDueDate;
      };

      const nextDueDate = calculateNextDueDate(task.frequency!, new Date());
      transactionOperations.push(
        prisma.task.update({
          where: { id: Number(taskId) },
          data: { dueDate: nextDueDate },
        })
      );
    } else {
      transactionOperations.push(
        prisma.bed.update({
          where: { id: Number(bedId) },
          data: {
            tasks: { disconnect: { id: Number(taskId) } },
          },
        })
      );
    }

    console.log('[TASK DONE] Starting transaction to mark task as done and update bed...');
    await prisma.$transaction(transactionOperations);
    console.log('[TASK DONE] Transaction successful.');

    console.log('[TASK DONE] Fetching updated bed data...');
    const updatedBed = await prisma.bed.findUnique({
      where: { id: Number(bedId) },
      include: {
        assignedTo: true,
        completedTasks: {
          include: {
            task: true,
          },
        },
        tasks: true,
      },
    });
    console.log('[TASK DONE] Updated bed data fetched. Sending response.');
    console.log(JSON.stringify(updatedBed, null, 2)); // Pretty print the response object

    res.status(200).json(updatedBed);
  } catch (error) {
    console.error('[TASK DONE] Error marking task as done:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign an existing task to a bed
app.post('/beds/:bedId/tasks', authenticateToken, async (req: AuthRequest, res) => {
  const { bedId } = req.params;
  const { taskId } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const bed = await prisma.bed.findUnique({
      where: { id: Number(bedId) },
      include: { project: { include: { users: true } } },
    });

    if (!bed || !bed.project.users.some(up => up.userId === userId)) {
      return res.status(404).json({ error: 'Bed not found or access denied' });
    }

    const updatedBed = await prisma.bed.update({
      where: { id: Number(bedId) },
      data: {
        tasks: { connect: { id: Number(taskId) } },
      },
    });
    res.status(200).json(updatedBed);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

// Add user to project
app.post('/projects/:projectId/users', authenticateToken, async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify user is an admin of the project
    const userProject = await prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId: userId,
          projectId: Number(projectId),
        },
      },
    });

    if (!userProject || userProject.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only project admins can add users' });
    }

    // Find the user to be added
    const userToAdd = await prisma.user.findUnique({ where: { email } });

    if (!userToAdd) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    // Check if user is already part of the project
    const existingUserProject = await prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId: userToAdd.id,
          projectId: Number(projectId),
        },
      },
    });

    if (existingUserProject) {
      return res.status(409).json({ error: 'User is already a member of this project' });
    }

    // Add user to the project
    await prisma.userProject.create({
      data: {
        userId: userToAdd.id,
        projectId: Number(projectId),
        role: role || 'MEMBER', // Default to MEMBER if role is not provided
      },
    });

    res.status(200).json({ message: 'User added to project successfully' });
  } catch (error) {
    console.error('Error adding user to project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
