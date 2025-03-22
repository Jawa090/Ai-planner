import type { Task, TaskCategory, Priority } from "@shared/schema";
import { format } from "date-fns";

export type TaskWithCategory = Task & { category?: TaskCategory };

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case "high":
      return "text-red-800 bg-red-100";
    case "medium":
      return "text-yellow-800 bg-yellow-100";
    case "low":
      return "text-gray-800 bg-gray-100";
    default:
      return "text-gray-800 bg-gray-100";
  }
};

export const getPriorityIcon = (priority: Priority): string => {
  switch (priority) {
    case "high":
      return "priority_high";
    case "medium":
      return "label_important";
    case "low":
      return "low_priority";
    default:
      return "low_priority";
  }
};

export const getCategoryColor = (task: Task, categories: TaskCategory[]): string => {
  if (!task.categoryId) return "border-gray-400 bg-gray-50";
  
  const category = categories.find(c => c.id === task.categoryId);
  
  switch (category?.name.toLowerCase()) {
    case "work":
      return "border-primary bg-primary bg-opacity-10";
    case "personal":
      return "border-blue-400 bg-blue-50";
    case "break":
      return "border-green-400 bg-green-50";
    case "meeting":
      return "border-blue-400 bg-blue-50";
    case "call":
      return "border-amber-400 bg-amber-50";
    case "reflection":
      return "border-purple-400 bg-purple-50";
    default:
      return "border-gray-400 bg-gray-50";
  }
};

export const getCategoryIcon = (category?: TaskCategory): string => {
  if (!category) return "label";
  
  switch (category.name.toLowerCase()) {
    case "work":
      return "work";
    case "personal":
      return "person";
    case "meeting":
      return "groups";
    case "break":
      return "self_improvement";
    case "call":
      return "phone";
    case "reflection":
      return "psychology";
    default:
      return "label";
  }
};

export const getCategoryBadgeColor = (category?: TaskCategory): string => {
  if (!category) return "bg-gray-200 text-gray-800";
  
  switch (category.name.toLowerCase()) {
    case "work":
      return "bg-indigo-100 text-indigo-800";
    case "personal":
      return "bg-blue-100 text-blue-800";
    case "meeting":
      return "bg-blue-100 text-blue-800";
    case "break":
      return "bg-green-100 text-green-800";
    case "call":
      return "bg-amber-100 text-amber-800";
    case "reflection":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

export const groupTasksByHour = (tasks: TaskWithCategory[]): Record<string, TaskWithCategory[]> => {
  const groupedTasks: Record<string, TaskWithCategory[]> = {};
  
  tasks.forEach((task) => {
    if (task.startTime) {
      const hour = format(task.startTime, "HH:mm");
      if (!groupedTasks[hour]) {
        groupedTasks[hour] = [];
      }
      groupedTasks[hour].push(task);
    }
  });
  
  return groupedTasks;
};
