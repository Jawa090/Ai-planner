import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Calendar from "@/pages/calendar";
import Tasks from "@/pages/tasks";
import MainLayout from "@/components/layout/main-layout";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function App() {
  const { toast } = useToast();

  // Initialize demo data
  useEffect(() => {
    const setupDemoData = async () => {
      try {
        await apiRequest("POST", "/api/setup-demo", {});
      } catch (error) {
        console.error("Failed to setup demo data:", error);
        toast({
          title: "Demo Setup",
          description: "Demo data already loaded or failed to setup.",
          variant: "destructive"
        });
      }
    };
    
    setupDemoData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/tasks" component={Tasks} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
