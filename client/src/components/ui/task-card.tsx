import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getPriorityColor, getPriorityIcon, getCategoryBadgeColor } from "@/lib/task-utils";
import { getRelativeDateDescription } from "@/lib/date-utils";
import type { TaskWithCategory } from "@/lib/task-utils";

interface TaskCardProps {
  task: TaskWithCategory;
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (taskId: number) => void;
  onToggleComplete: (taskId: number, isCompleted: boolean) => void;
}

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={(checked) => {
              onToggleComplete(task.id, checked as boolean);
            }}
            className="w-5 h-5 rounded-full border-2 border-primary"
          />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center mt-2 text-xs gap-2">
            {task.category && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${getCategoryBadgeColor(task.category)}`}>
                {task.category.name}
              </span>
            )}
            
            {task.date && (
              <span className="text-gray-500 flex items-center">
                <span className="material-icons text-xs mr-1">schedule</span>
                {getRelativeDateDescription(task.date)}
                {task.startTime && `, ${format(task.startTime, "h:mm a")}`}
              </span>
            )}
            
            {task.priority && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                <span className="material-icons text-xs mr-1">{getPriorityIcon(task.priority)}</span>
                {task.priority === "high" ? "Urgent" : 
                 task.priority === "medium" ? "Medium" : "Low"}
              </span>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TaskCard;
