import { Priority } from "@shared/schema";
import { getPriorityColor, getPriorityIcon } from "@/lib/task-utils";
import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const PriorityBadge = ({ priority, className = "" }: PriorityBadgeProps) => {
  return (
    <Badge variant="outline" className={`${getPriorityColor(priority)} gap-1 ${className}`}>
      <span className="material-icons text-xs">{getPriorityIcon(priority)}</span>
      <span>
        {priority === "high" 
          ? "High Priority" 
          : priority === "medium" 
            ? "Medium Priority" 
            : "Low Priority"}
      </span>
    </Badge>
  );
};

export default PriorityBadge;
