import { useMemo } from "react";
import { format } from "date-fns";
import { TaskWithCategory } from "@/lib/task-utils";
import { getCategoryColor, getCategoryIcon, getCategoryBadgeColor, getPriorityColor, getPriorityIcon } from "@/lib/task-utils";
import type { TaskCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit2 } from "lucide-react";

interface TimelineProps {
  tasks: TaskWithCategory[];
  categories: TaskCategory[];
  onEditTask: (task: TaskWithCategory) => void;
}

interface TimeBlockProps {
  time: string;
  tasks: TaskWithCategory[];
  categories: TaskCategory[];
  onEditTask: (task: TaskWithCategory) => void;
}

const TimeBlock = ({ time, tasks, categories, onEditTask }: TimeBlockProps) => {
  const formattedTime = format(new Date(`2000-01-01T${time}`), "h:mm a");
  
  return (
    <div className="px-6 py-3 flex">
      <div className="w-16 pt-1 text-right pr-4 text-gray-500 text-sm font-medium">
        {formattedTime}
      </div>
      <div className="flex-1 pl-4 border-l border-gray-200">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`${getCategoryColor(task, categories)} px-4 py-3 rounded-lg border-l-4 mb-2`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => onEditTask(task)}
                >
                  <span className="material-icons text-sm">edit</span>
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons text-sm">more_horiz</span>
                </button>
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs">
              {task.categoryId && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${getCategoryBadgeColor(categories.find(c => c.id === task.categoryId))}`}>
                  <span className="material-icons text-xs mr-1">
                    {getCategoryIcon(categories.find(c => c.id === task.categoryId))}
                  </span>
                  {categories.find(c => c.id === task.categoryId)?.name || "Category"}
                </span>
              )}
              {task.priority && (
                <span className={`${task.categoryId ? 'ml-2' : ''} inline-flex items-center px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                  <span className="material-icons text-xs mr-1">{getPriorityIcon(task.priority)}</span>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
              )}
              {task.startTime && task.endTime && (
                <span className="ml-2 text-gray-500">
                  {format(task.startTime, "h:mm a")} - {format(task.endTime, "h:mm a")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Timeline = ({ tasks, categories, onEditTask }: TimelineProps) => {
  // Group tasks by hour
  const groupedTasks = useMemo(() => {
    const grouped: Record<string, TaskWithCategory[]> = {};
    
    // Create time slots from 8am to 6pm
    for (let i = 8; i <= 18; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`;
      const halfHour = i < 10 ? `0${i}:30` : `${i}:30`;
      
      grouped[hour] = [];
      grouped[halfHour] = [];
    }
    
    // Add tasks to their respective time slots
    tasks.forEach(task => {
      if (task.startTime) {
        const hour = format(task.startTime, "HH:mm");
        
        // Find the closest time slot
        const slots = Object.keys(grouped);
        const closestSlot = slots.reduce((prev, curr) => {
          return Math.abs(Number(curr.replace(':', '')) - Number(hour.replace(':', ''))) < 
                 Math.abs(Number(prev.replace(':', '')) - Number(hour.replace(':', '')))
                 ? curr : prev;
        });
        
        if (!grouped[hour]) {
          grouped[closestSlot].push(task);
        } else {
          grouped[hour].push(task);
        }
      }
    });
    
    // Filter out empty time slots
    return Object.entries(grouped)
      .filter(([_, tasks]) => tasks.length > 0)
      .sort(([timeA], [timeB]) => {
        return timeA.localeCompare(timeB);
      })
      .reduce((acc, [time, tasks]) => {
        acc[time] = tasks;
        return acc;
      }, {} as Record<string, TaskWithCategory[]>);
  }, [tasks]);

  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Today's Schedule</h3>
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary-700 text-sm font-medium flex items-center"
        >
          <span className="material-icons text-sm mr-1">add</span> Add Task
        </Button>
      </div>
      
      <div className="divide-y divide-gray-100">
        {Object.entries(groupedTasks).map(([time, tasks]) => (
          <TimeBlock 
            key={time} 
            time={time} 
            tasks={tasks} 
            categories={categories} 
            onEditTask={onEditTask}
          />
        ))}
        
        {Object.keys(groupedTasks).length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tasks scheduled for today.</p>
            <Button className="mt-4">Add Your First Task</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
