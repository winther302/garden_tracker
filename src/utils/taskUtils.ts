import { Task, CompletedTask } from '../types';

export const calculateNextDueDate = (task: Task, completedTasks: CompletedTask[]): Date | null => {
  if (task.dueDate) {
    return new Date(task.dueDate);
  }

  const lastCompletion = completedTasks
    .filter(ct => ct.task.id === task.id)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

  const baseDate = lastCompletion ? new Date(lastCompletion.completedAt) : new Date();
  const nextDate = new Date(baseDate);

  if (task.frequency) {
    switch (task.frequency) {
      case 'daily':
        nextDate.setDate(baseDate.getDate() + 1);
        break;
      case 'every 2 days':
        nextDate.setDate(baseDate.getDate() + 2);
        break;
      case 'weekly':
        nextDate.setDate(baseDate.getDate() + 7);
        break;
      // Add more frequency cases as needed
      default:
        return null;
    }
    return nextDate;
  }

  return null;
};
