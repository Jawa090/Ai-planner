import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import type { AiSuggestion as AiSuggestionType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AiSuggestionProps {
  suggestion: AiSuggestionType;
}

const AiSuggestion = ({ suggestion }: AiSuggestionProps) => {
  const { toast } = useToast();
  
  // Apply suggestion mutation
  const applySuggestion = useMutation({
    mutationFn: async () => {
      // First mark the suggestion as applied
      await apiRequest('PATCH', `/api/suggestions/${suggestion.id}`, { isApplied: true });
      
      // Then apply the suggestion (in a real app, this would modify tasks)
      if (suggestion.suggestionData && typeof suggestion.suggestionData === 'object') {
        const data = suggestion.suggestionData as any;
        
        if (data.taskIdsToReschedule && Array.isArray(data.taskIdsToReschedule)) {
          for (const taskId of data.taskIdsToReschedule) {
            if (data.suggestedTime) {
              // In a real app, this would properly parse and set the time
              // For now, we'll just show a toast
              toast({
                title: "Suggestion Applied",
                description: `Task ${taskId} rescheduled to ${data.suggestedTime}`,
              });
            }
          }
        }
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      toast({
        title: "Success",
        description: "The AI suggestion has been applied to your schedule.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to apply the suggestion. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Dismiss suggestion mutation
  const dismissSuggestion = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', `/api/suggestions/${suggestion.id}`, { isDismissed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
      
      toast({
        title: "Suggestion Dismissed",
        description: "The AI suggestion has been dismissed.",
      });
    }
  });

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 mb-6">
      <div className="flex items-start">
        <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-4">
          <span className="material-icons text-primary">tips_and_updates</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">AI Suggestion</h3>
          <p className="text-gray-600 text-sm mb-3">{suggestion.message}</p>
          <div className="flex space-x-2">
            <Button 
              className="px-3 py-1.5" 
              onClick={() => applySuggestion.mutate()}
              disabled={applySuggestion.isPending}
            >
              {applySuggestion.isPending ? "Applying..." : "Apply Suggestion"}
            </Button>
            <Button 
              variant="ghost" 
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
              onClick={() => dismissSuggestion.mutate()}
              disabled={dismissSuggestion.isPending}
            >
              {dismissSuggestion.isPending ? "Dismissing..." : "Dismiss"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestion;
