import { useLocation } from "wouter";

const Sidebar = () => {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Today", icon: "dashboard" },
    { path: "/calendar", label: "Calendar", icon: "calendar_today" },
    { path: "/tasks", label: "Tasks", icon: "task_alt" },
    { path: "/analytics", label: "Analytics", icon: "insights" },
    { path: "/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 py-6 px-4">
      <div className="flex items-center mb-8 px-2">
        <span className="material-icons text-primary text-2xl mr-2">schedule</span>
        <h1 className="font-bold text-xl">AI Daily Planner</h1>
      </div>
      
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <a
                href={item.path}
                className={`flex items-center px-2 py-2 rounded-lg font-medium ${
                  location === item.path 
                    ? "text-primary bg-indigo-50" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-3">
            <span className="text-sm font-semibold">JD</span>
          </div>
          <div>
            <p className="font-medium text-sm">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
