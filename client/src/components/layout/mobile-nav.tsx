import { useLocation } from "wouter";

interface MobileNavProps {
  onAddTask: () => void;
}

const MobileNav = ({ onAddTask }: MobileNavProps) => {
  const [location, navigate] = useLocation();
  
  const navItems = [
    { path: "/", label: "Today", icon: "dashboard" },
    { path: "/calendar", label: "Calendar", icon: "calendar_today" },
    { path: "/tasks", label: "Tasks", icon: "task_alt" },
    { path: "/analytics", label: "Analytics", icon: "insights" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
      <div className="flex justify-around">
        {navItems.slice(0, 2).map((item) => (
          <a 
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center p-2 ${
              location === item.path ? "text-primary" : "text-gray-500"
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        ))}
        
        <button 
          className="flex items-center justify-center w-12 h-12 bg-primary rounded-full text-white shadow-lg -mt-6"
          onClick={onAddTask}
        >
          <span className="material-icons">add</span>
        </button>
        
        {navItems.slice(2).map((item) => (
          <a 
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center p-2 ${
              location === item.path ? "text-primary" : "text-gray-500"
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
