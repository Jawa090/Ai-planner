import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTaskSchema, insertTaskCategorySchema, insertAiSuggestionSchema } from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // If date is provided, get tasks for that date
    if (req.query.date) {
      const date = new Date(req.query.date as string);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const tasks = await storage.getTasksByUserIdAndDate(userId, date);
      return res.json(tasks);
    }

    // Otherwise get all tasks for the user
    const tasks = await storage.getTasksByUserId(userId);
    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(task);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
      const updatedTask = await storage.updateTask(taskId, req.body);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const deleted = await storage.deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).end();
  });

  // Task category routes
  app.get("/api/categories", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const categories = await storage.getTaskCategoriesByUserId(userId);
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = insertTaskCategorySchema.parse(req.body);
      const newCategory = await storage.createTaskCategory(category);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  // AI suggestion routes
  app.get("/api/suggestions", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const suggestions = await storage.getActiveAiSuggestionsByUserId(userId);
    res.json(suggestions);
  });

  app.post("/api/suggestions", async (req, res) => {
    try {
      const suggestion = insertAiSuggestionSchema.parse(req.body);
      const newSuggestion = await storage.createAiSuggestion(suggestion);
      res.status(201).json(newSuggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid suggestion data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create suggestion" });
      }
    }
  });

  app.patch("/api/suggestions/:id", async (req, res) => {
    const suggestionId = parseInt(req.params.id);
    if (isNaN(suggestionId)) {
      return res.status(400).json({ message: "Invalid suggestion ID" });
    }

    try {
      const updatedSuggestion = await storage.updateAiSuggestion(suggestionId, req.body);
      if (!updatedSuggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      res.json(updatedSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update suggestion" });
    }
  });

  // Add initial data setup endpoint for demo
  app.post("/api/setup-demo", async (req, res) => {
    const userId = 1; // Default user
    
    // Create initial tasks for demo
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    
    try {
      // Create tasks for today
      const tasks = [
        {
          title: "Deep Work Session",
          description: "Complete project proposal",
          startTime: new Date(`${formattedDate}T09:00:00`),
          endTime: new Date(`${formattedDate}T11:00:00`),
          isCompleted: false,
          priority: "high",
          categoryId: 1, // Work category
          userId: userId,
          date: today
        },
        {
          title: "Team Meeting",
          description: "Weekly sprint planning",
          startTime: new Date(`${formattedDate}T11:30:00`),
          endTime: new Date(`${formattedDate}T12:30:00`),
          isCompleted: false,
          priority: "medium",
          categoryId: 1, // Work category
          userId: userId,
          date: today
        },
        {
          title: "Lunch Break",
          description: "Rest and recharge",
          startTime: new Date(`${formattedDate}T12:30:00`),
          endTime: new Date(`${formattedDate}T13:30:00`),
          isCompleted: false,
          priority: "medium",
          categoryId: 2, // Personal category
          userId: userId,
          date: today
        },
        {
          title: "Client Call",
          description: "Review feedback on latest design",
          startTime: new Date(`${formattedDate}T14:00:00`),
          endTime: new Date(`${formattedDate}T15:00:00`),
          isCompleted: false,
          priority: "high",
          categoryId: 1, // Work category
          userId: userId,
          date: today
        },
        {
          title: "Email Processing",
          description: "Clear inbox and respond to messages",
          startTime: new Date(`${formattedDate}T15:30:00`),
          endTime: new Date(`${formattedDate}T16:30:00`),
          isCompleted: false,
          priority: "low",
          categoryId: 1, // Work category
          userId: userId,
          date: today
        },
        {
          title: "Daily Reflection",
          description: "Review accomplishments and plan tomorrow",
          startTime: new Date(`${formattedDate}T17:00:00`),
          endTime: new Date(`${formattedDate}T17:30:00`),
          isCompleted: false,
          priority: "medium",
          categoryId: 2, // Personal category
          userId: userId,
          date: today
        }
      ];
      
      const createdTasks = [];
      for (const task of tasks) {
        const newTask = await storage.createTask(task as any);
        createdTasks.push(newTask);
      }
      
      // Create upcoming tasks
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const upcomingTasks = [
        {
          title: "Finalize quarterly report",
          description: "",
          startTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
          endTime: new Date(tomorrow.setHours(12, 0, 0, 0)),
          isCompleted: false,
          priority: "high",
          categoryId: 1, // Work category
          userId: userId,
          date: tomorrow
        },
        {
          title: "Review design feedback",
          description: "",
          startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
          endTime: new Date(tomorrow.setHours(15, 0, 0, 0)),
          isCompleted: false,
          priority: "medium",
          categoryId: 1, // Work category
          userId: userId,
          date: tomorrow
        }
      ];
      
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() + 3);
      
      upcomingTasks.push({
        title: "Schedule dentist appointment",
        description: "",
        startTime: null,
        endTime: null,
        isCompleted: false,
        priority: "medium",
        categoryId: 2, // Personal category
        userId: userId,
        date: thisWeek
      });
      
      const weekend = new Date();
      weekend.setDate(weekend.getDate() + 5);
      
      upcomingTasks.push({
        title: "Grocery shopping",
        description: "",
        startTime: null,
        endTime: null,
        isCompleted: false,
        priority: "low",
        categoryId: 2, // Personal category
        userId: userId,
        date: weekend
      });
      
      for (const task of upcomingTasks) {
        await storage.createTask(task as any);
      }
      
      res.status(200).json({ message: "Demo data setup complete" });
    } catch (error) {
      console.error("Error setting up demo data:", error);
      res.status(500).json({ message: "Failed to setup demo data" });
    }
  });

  return httpServer;
}
