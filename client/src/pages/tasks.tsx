import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskList from "@/components/calendar/task-list";
import AddTaskDialog from "@/components/forms/add-task-dialog";
import type { Task, TaskCategory } from "@shared/schema";
import type { TaskWithCategory } from "@/lib/task-utils";

const Tasks = () => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithCategory | null>(null);
  
  // Fetch all tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { userId: 1 }],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?userId=1`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    }
  });
  
  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TaskCategory[]>({
    queryKey: ['/api/categories', { userId: 1 }],
    queryFn: async () => {
      const res = await fetch(`/api/categories?userId=1`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });
  
  // Task completion mutation
  const toggleTaskCompletion = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: number, isCompleted: boolean }) => {
      return apiRequest('PATCH', `/api/tasks/${taskId}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });
  
  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest('DELETE', `/api/tasks/${taskId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });
  
  // Handle edit task
  const handleEditTask = (task: TaskWithCategory) => {
    setSelectedTask(task);
    setIsAddTaskOpen(true);
  };
  
  // Enhance tasks with category information
  const tasksWithCategories: TaskWithCategory[] = tasks.map(task => ({
    ...task,
    category: categories.find(c => c.id === task.categoryId)
  }));
  
  // Filter tasks for different tabs
  const pendingTasks = tasksWithCategories.filter(task => !task.isCompleted);
  const completedTasks = tasksWithCategories.filter(task => task.isCompleted);
  
  // Group tasks by priority
  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');
  const mediumPriorityTasks = pendingTasks.filter(task => task.priority === 'medium');
  const lowPriorityTasks = pendingTasks.filter(task => task.priority === 'low');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tasks ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="priority">By Priority</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {tasksLoading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : (
            <TaskList 
              tasks={pendingTasks} 
              onEdit={handleEditTask}
              onDelete={(taskId) => deleteTask.mutate(taskId)}
              onToggleComplete={(taskId, isCompleted) => 
                toggleTaskCompletion.mutate({ taskId, isCompleted })
              }
            />
          )}
        </TabsContent>
        
        <TabsContent value="priority" className="mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-semibold mb-3 text-red-600">High Priority ({highPriorityTasks.length})</h3>
              <TaskList 
                tasks={highPriorityTasks} 
                onEdit={handleEditTask}
                onDelete={(taskId) => deleteTask.mutate(taskId)}
                onToggleComplete={(taskId, isCompleted) => 
                  toggleTaskCompletion.mutate({ taskId, isCompleted })
                }
              />
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-3 text-yellow-600">Medium Priority ({mediumPriorityTasks.length})</h3>
              <TaskList 
                tasks={mediumPriorityTasks} 
                onEdit={handleEditTask}
                onDelete={(taskId) => deleteTask.mutate(taskId)}
                onToggleComplete={(taskId, isCompleted) => 
                  toggleTaskCompletion.mutate({ taskId, isCompleted })
                }
              />
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-600">Low Priority ({lowPriorityTasks.length})</h3>
              <TaskList 
                tasks={lowPriorityTasks} 
                onEdit={handleEditTask}
                onDelete={(taskId) => deleteTask.mutate(taskId)}
                onToggleComplete={(taskId, isCompleted) => 
                  toggleTaskCompletion.mutate({ taskId, isCompleted })
                }
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <TaskList 
            tasks={completedTasks} 
            onEdit={handleEditTask}
            onDelete={(taskId) => deleteTask.mutate(taskId)}
            onToggleComplete={(taskId, isCompleted) => 
              toggleTaskCompletion.mutate({ taskId, isCompleted })
            }
          />
        </TabsContent>
      </Tabs>
      
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        categories={categories}
      />
    </div>
  );
};

export default Tasks;
