import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { formatDate, getPreviousDay, getNextDay } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Timeline from "@/components/ui/timeline";
import AiSuggestion from "@/components/calendar/ai-suggestion";
import TaskList from "@/components/calendar/task-list";
import AddTaskDialog from "@/components/forms/add-task-dialog";
import type { TaskWithCategory } from "@/lib/task-utils";
import type { Task, TaskCategory, AiSuggestion as AiSuggestionType } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

const DailyView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithCategory | null>(null);
  
  // Fetch tasks for the current date
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { userId: 1, date: format(currentDate, 'yyyy-MM-dd') }],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?userId=1&date=${format(currentDate, 'yyyy-MM-dd')}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    }
  });
  
  // Fetch upcoming tasks
  const { data: upcomingTasks = [], isLoading: upcomingTasksLoading } = useQuery<Task[]>({
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
  
  // Fetch AI suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<AiSuggestionType[]>({
    queryKey: ['/api/suggestions', { userId: 1 }],
    queryFn: async () => {
      const res = await fetch(`/api/suggestions?userId=1`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
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
  
  // Handle navigation
  const goToPreviousDay = () => setCurrentDate(getPreviousDay(currentDate));
  const goToNextDay = () => setCurrentDate(getNextDay(currentDate));
  
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
  
  const upcomingTasksWithCategories: TaskWithCategory[] = upcomingTasks
    .filter(task => {
      // Filter out tasks from today
      const taskDate = new Date(task.date);
      const today = new Date();
      return taskDate.getDate() !== today.getDate() || 
             taskDate.getMonth() !== today.getMonth() || 
             taskDate.getFullYear() !== today.getFullYear();
    })
    .map(task => ({
      ...task,
      category: categories.find(c => c.id === task.categoryId)
    }));
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Date Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{formatDate(currentDate)}</h2>
          <p className="text-gray-500">Your personalized schedule</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex items-center"
            onClick={goToPreviousDay}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex items-center"
            onClick={goToNextDay}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* View Toggle */}
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg w-max">
        <button className="px-4 py-1.5 bg-white rounded-md shadow-sm text-sm font-medium">
          Day
        </button>
        <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
          Week
        </button>
      </div>
      
      {/* AI Suggestion */}
      {suggestions.length > 0 && (
        <AiSuggestion suggestion={suggestions[0]} />
      )}
      
      {/* Day Timeline */}
      <Timeline 
        tasks={tasksWithCategories} 
        categories={categories}
        onEditTask={handleEditTask}
      />
      
      {/* Tasks Section */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-4">Upcoming Tasks</h3>
        
        <TaskList 
          tasks={upcomingTasksWithCategories} 
          onEdit={handleEditTask}
          onDelete={(taskId) => deleteTask.mutate(taskId)}
          onToggleComplete={(taskId, isCompleted) => 
            toggleTaskCompletion.mutate({ taskId, isCompleted })
          }
        />
      </div>
      
      {/* Add/Edit Task Dialog */}
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

export default DailyView;
