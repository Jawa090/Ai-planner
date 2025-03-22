import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TaskCategory } from "@shared/schema";
import type { TaskWithCategory } from "@/lib/task-utils";
import { priorities } from "@shared/schema";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithCategory | null;
  onClose?: () => void;
  categories?: TaskCategory[];
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  priority: z.enum([priorities.HIGH, priorities.MEDIUM, priorities.LOW]),
  categoryId: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddTaskDialog = ({ open, onOpenChange, task, onClose, categories = [] }: AddTaskDialogProps) => {
  const { toast } = useToast();
  const isEditMode = !!task;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      priority: priorities.MEDIUM,
      categoryId: undefined,
    },
  });
  
  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        date: new Date(task.date),
        startTime: task.startTime ? new Date(task.startTime).toTimeString().slice(0, 5) : "",
        endTime: task.endTime ? new Date(task.endTime).toTimeString().slice(0, 5) : "",
        priority: task.priority,
        categoryId: task.categoryId,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        date: new Date(),
        startTime: "",
        endTime: "",
        priority: priorities.MEDIUM,
        categoryId: undefined,
      });
    }
  }, [task, form]);
  
  // Create/update task mutation
  const taskMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const startTime = values.startTime
        ? new Date(`${values.date.toISOString().split("T")[0]}T${values.startTime}`)
        : null;
      
      const endTime = values.endTime
        ? new Date(`${values.date.toISOString().split("T")[0]}T${values.endTime}`)
        : null;
      
      const payload = {
        title: values.title,
        description: values.description,
        date: values.date,
        startTime,
        endTime,
        priority: values.priority,
        categoryId: values.categoryId,
        userId: 1, // Hardcoded for demo
        isCompleted: task?.isCompleted || false,
      };
      
      if (isEditMode && task) {
        return apiRequest("PATCH", `/api/tasks/${task.id}`, payload);
      } else {
        return apiRequest("POST", "/api/tasks", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onOpenChange(false);
      if (onClose) onClose();
      
      toast({
        title: isEditMode ? "Task Updated" : "Task Created",
        description: isEditMode 
          ? "Your task has been updated successfully."
          : "Your task has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} task. Please try again.`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    taskMutation.mutate(values);
  };
  
  const handleClose = () => {
    if (onClose) onClose();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={priorities.HIGH}>High</SelectItem>
                        <SelectItem value={priorities.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={priorities.LOW}>Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time (optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value?.toString()}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={taskMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={taskMutation.isPending}
              >
                {taskMutation.isPending 
                  ? "Saving..." 
                  : isEditMode ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
