import { useState } from "react";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import Header from "./header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddTaskDialog from "@/components/forms/add-task-dialog";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <Header />
      
      {/* Sidebar (desktop) */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0 bg-gray-50">
        {children}
      </main>
      
      {/* Mobile Nav */}
      <MobileNav onAddTask={() => setIsAddTaskOpen(true)} />
      
      {/* Add Task FAB (desktop) */}
      <div className="hidden md:block fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="w-14 h-14 rounded-full p-0"
          onClick={() => setIsAddTaskOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
      />
    </div>
  );
};

export default MainLayout;
