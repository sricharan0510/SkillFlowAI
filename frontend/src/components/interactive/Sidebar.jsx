import { Home, Book, FileText, ClipboardList, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const sidebarLinks = [
  { name: "Dashboard", icon: Home, to: "/dashboard" },
  { name: "Study Materials", icon: Book, to: "/dashboard/upload" },
  { name: "Exams", icon: ClipboardList, to: "/dashboard/exams" },
  { name: "Summaries", icon: FileText, to: "/dashboard/summaries" },
  { name: "Mock Interviews", icon: UserRound, to: "/dashboard/interviews" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4 flex flex-col z-40">
      <div className="text-2xl font-bold mb-8">SkillFlow AI</div>

      <nav className="space-y-2">
        {sidebarLinks.map(({ name, icon: Icon, to }) => (
          <NavLink
            key={name}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition 
              ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`
            }
          >
            <Icon className="h-5 w-5" />
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
