export interface Task {
  id: number;
  name: string;
  dueDate?: Date; // Optional fixed due date
  frequency?: string; // e.g., "daily", "every 2 days", "weekly"
}



export interface CompletedTask {
  task: Task;
  completedAt: Date;
}

export interface Bed {
  id: number;
  name: string;
  assignedTo?: User; // Changed from Person to User
  tasks: Task[];
  completedTasks: CompletedTask[];
}

export interface User {
  id: number;
  email: string;
}

export interface UserProject {
  userId: number;
  projectId: number;
  role: "ADMIN" | "MEMBER";
  user?: User; // Optionally include user details if fetched
}

export interface Project {
  id: number;
  name: string;
  beds: Bed[];
  tasks: Task[];
  users: UserProject[]; // Add users to the Project interface
}