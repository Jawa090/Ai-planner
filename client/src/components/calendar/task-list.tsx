import TaskCard from "@/components/ui/task-card";
import type { TaskWithCategory } from "@/lib/task-utils";

interface TaskListProps {
  tasks: TaskWithCategory[];
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (taskId: number) => void;
  onToggleComplete: (taskId: number, isCompleted: boolean) => void;
}

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No upcoming tasks</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
};

export default TaskList;
