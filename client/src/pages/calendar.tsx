import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Task } from "@shared/schema";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Fetch all tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { userId: 1 }],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?userId=1`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    }
  });

  // Get all dates that have tasks
  const tasksDateMap = tasks.reduce((acc, task) => {
    const dateStr = format(new Date(task.date), 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Get tasks for selected date
  const selectedDateTasks = selectedDate
    ? tasks.filter(task => isSameDay(new Date(task.date), selectedDate))
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Pick a Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                booked: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return !!tasksDateMap[dateStr];
                }
              }}
              modifiersClassNames={{
                booked: 'bg-primary text-white hover:bg-primary hover:text-white rounded-full'
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateTasks.length === 0 ? (
              <p className="text-gray-500">No tasks scheduled for this day.</p>
            ) : (
              <div className="space-y-4">
                {selectedDateTasks.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <span className="text-sm text-gray-500">
                        {task.startTime ? format(new Date(task.startTime), 'h:mm a') : 'All day'}
                      </span>
                    </div>
                    {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
