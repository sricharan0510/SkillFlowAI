import {
  LayoutDashboard,
  FolderOpen,
  GraduationCap,
  FileText,
  Mic2,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group 
    ${isActive
      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-40">

      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">SF</div>
        <span className="text-xl font-bold tracking-tight">SkillFlow AI</span>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-4">

        <div>
          <p className="px-4 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
            Main
          </p>
          <div className="space-y-1">
            <NavLink to="/dashboard" end className={navItemClass}>
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink to="/dashboard/library" className={navItemClass}>
              <FolderOpen className="h-5 w-5" />
              My Library
            </NavLink>
          </div>
        </div>

        <div>
          <p className="px-4 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
            AI Tools
          </p>
          <div className="space-y-1">
            <NavLink to="/dashboard/summaries" className={navItemClass}>
              <FileText className="h-5 w-5" />
              Smart Notes
            </NavLink>
            <NavLink to="/dashboard/exams" className={navItemClass}>
              <GraduationCap className="h-5 w-5" />
              Exam Hall
            </NavLink>
            <NavLink to="/dashboard/interviews" className={navItemClass}>
              <Mic2 className="h-5 w-5" />
              Mock Interview
            </NavLink>
          </div>
        </div>

        <div>
          <p className="px-4 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
            Growth
          </p>
          <div className="space-y-1">
            <NavLink to="/dashboard/performance" className={navItemClass}>
              <BarChart3 className="h-5 w-5" />
              Performance
            </NavLink>
          </div>
        </div>

      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <NavLink to="/dashboard/settings" className={navItemClass}>
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>

    </aside>
  );
}