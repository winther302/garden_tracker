export interface Task {
  id: number;
  name: string;
  dueDate?: Date; // Optional fixed due date
  frequency?: string; // e.g., "daily", "every 2 days", "weekly"
}

export interface Person {
  id: number;
  name: string;
}

export interface CompletedTask {
  task: Task;
  completedAt: Date;
}

export interface Bed {
  id: number;
  name: string;
  assignedTo?: Person;
  tasks: Task[];
  completedTasks: CompletedTask[];
}

export interface Project {
  id: number;
  name: string;
  beds: Bed[];
  tasks: Task[];
}