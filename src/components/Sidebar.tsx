import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { 
  BookOpen, 
  LayoutDashboard, 
  BarChart3, 
  Award, 
  FileSpreadsheet, 
  Settings, 
  HelpCircle,
  Users,
  Scroll,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  const studentItems = [
    { id: "dashboard", label: "Workplace Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Learning Catalog", icon: BookOpen },
    { id: "analytics", label: "Progress Analytics", icon: BarChart3 },
    { id: "certificates", label: "Certifications", icon: Award },
    { id: "reports", label: "Business Intelligence", icon: FileSpreadsheet },
    { id: "profile", label: "Account Profile", icon: Settings },
  ];

  const adminItems = [
    { id: "admin_dashboard", label: "Systems Console", icon: LayoutDashboard },
    { id: "admin_courses", label: "Manage Courses", icon: BookOpen },
    { id: "admin_lessons", label: "Manage Lessons", icon: Scroll },
    { id: "admin_quizzes", label: "Manage Quizzes", icon: ShieldCheck },
    { id: "admin_users", label: "System Users", icon: Users },
    { id: "admin_logs", label: "Operational Logs", icon: FileSpreadsheet },
    { id: "profile", label: "Account Profile", icon: Settings },
  ];

  const menuItems = isAdmin ? adminItems : studentItems;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-xl py-6 px-4 justify-between shrink-0 select-none">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            {isAdmin ? "Admin Workspace" : "Student Workspace"}
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === "admin_courses" && activeTab === "admin"); // Fallback for reverse compatibility
              return (
                <button
                  key={item.id}
                  id={`sidebar_tab_${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? isAdmin
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0 text-current" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="space-y-4">
        {!isAdmin && (
          /* Goal Indicator only shown for non-admins */
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Streak Goal</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">{user.streak || 1} Days</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: "75%" }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Personal status verification active.</p>
          </div>
        )}

        {isAdmin && (
          <div className="p-4 bg-purple-950/20 rounded-2xl border border-purple-900/30 text-center">
            <span className="text-[10px] font-mono tracking-wider font-extrabold text-purple-400 uppercase block">CONSOLE LOG LOCKED</span>
            <p className="text-[10px] text-slate-400 mt-1">Authorized Admin Matrix active.</p>
          </div>
        )}

        <div className="border-t border-slate-800 pt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
            <HelpCircle className="h-4.5 w-4.5" />
            <span>Matrix v1.2</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
