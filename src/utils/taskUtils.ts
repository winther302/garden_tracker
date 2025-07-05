import { Task, CompletedTask } from '../types';

export const calculateNextDueDate = (task: Task, completedTasks: CompletedTask[]): Date | null => {
  if (task.dueDate) {
    return task.dueDate;
  }

  const lastCompletion = completedTasks
    .filter(ct => ct.task.id === task.id)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];

  let baseDate = lastCompletion ? lastCompletion.completedAt : new Date();
  let nextDate = new Date(baseDate);

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
