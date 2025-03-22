import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  taskCategories, type TaskCategory, type InsertTaskCategory,
  aiSuggestions, type AiSuggestion, type InsertAiSuggestion
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTasksByUserIdAndDate(userId: number, date: Date): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Task category methods
  getTaskCategory(id: number): Promise<TaskCategory | undefined>;
  getTaskCategoriesByUserId(userId: number): Promise<TaskCategory[]>;
  createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory>;
  
  // AI suggestion methods
  getAiSuggestion(id: number): Promise<AiSuggestion | undefined>;
  getActiveAiSuggestionsByUserId(userId: number): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  updateAiSuggestion(id: number, suggestion: Partial<AiSuggestion>): Promise<AiSuggestion | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private taskCategories: Map<number, TaskCategory>;
  private aiSuggestions: Map<number, AiSuggestion>;
  
  private userId: number;
  private taskId: number;
  private categoryId: number;
  private suggestionId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.taskCategories = new Map();
    this.aiSuggestions = new Map();
    
    this.userId = 1;
    this.taskId = 1;
    this.categoryId = 1;
    this.suggestionId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: InsertUser = {
      username: "johndoe",
      password: "password123", // In a real app, this would be hashed
      email: "john@example.com",
      displayName: "John Doe",
      initials: "JD"
    };
    this.createUser(defaultUser);
    
    // Create default categories
    const workCategory: InsertTaskCategory = {
      name: "Work",
      color: "#4F46E5", // indigo color
      userId: 1
    };
    const personalCategory: InsertTaskCategory = {
      name: "Personal",
      color: "#3B82F6", // blue color
      userId: 1
    };
    this.createTaskCategory(workCategory);
    this.createTaskCategory(personalCategory);
    
    // Create default tasks
    const today = new Date();
    
    // Sample AI suggestion
    const aiSuggestion: InsertAiSuggestion = {
      message: "I've noticed you've been scheduling deep work after lunch when your energy is lower. Would you like me to move deep work sessions to morning hours?",
      userId: 1,
      isApplied: false,
      isDismissed: false,
      suggestionData: {
        taskIdsToReschedule: [1],
        suggestedTime: "9:00 AM"
      }
    };
    this.createAiSuggestion(aiSuggestion);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTasksByUserIdAndDate(userId: number, date: Date): Promise<Task[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && 
                task.date >= startOfDay && 
                task.date <= endOfDay
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Task category methods
  async getTaskCategory(id: number): Promise<TaskCategory | undefined> {
    return this.taskCategories.get(id);
  }

  async getTaskCategoriesByUserId(userId: number): Promise<TaskCategory[]> {
    return Array.from(this.taskCategories.values()).filter(
      (category) => category.userId === userId
    );
  }

  async createTaskCategory(insertCategory: InsertTaskCategory): Promise<TaskCategory> {
    const id = this.categoryId++;
    const category: TaskCategory = { ...insertCategory, id };
    this.taskCategories.set(id, category);
    return category;
  }

  // AI suggestion methods
  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    return this.aiSuggestions.get(id);
  }

  async getActiveAiSuggestionsByUserId(userId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values()).filter(
      (suggestion) => 
        suggestion.userId === userId && 
        !suggestion.isApplied && 
        !suggestion.isDismissed
    );
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.suggestionId++;
    const createdAt = new Date();
    const suggestion: AiSuggestion = { 
      ...insertSuggestion, 
      id, 
      createdAt
    };
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }

  async updateAiSuggestion(id: number, updateData: Partial<AiSuggestion>): Promise<AiSuggestion | undefined> {
    const suggestion = this.aiSuggestions.get(id);
    if (!suggestion) return undefined;

    const updatedSuggestion = { ...suggestion, ...updateData };
    this.aiSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
}

export const storage = new MemStorage();
