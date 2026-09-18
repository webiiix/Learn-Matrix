import { useDispatch, useSelector } from "react-redux";
import { RootState, logoutUser } from "../store";
import { LogOut, User, Landmark, Shield, Award, Sparkles } from "lucide-react";

export function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    (dispatch as any)(logoutUser());
    window.location.hash = "#login";
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl select-none">
          LX
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            LEARN<span className="text-emerald-500">MATRIX</span>
          </h1>
          <p className="text-[10px] font-mono tracking-wider uppercase text-slate-400">Enterprise LMS</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
            <div className="text-right">
              <span className="block text-sm font-semibold text-slate-800">{user.fullName}</span>
              <span className="flex items-center justify-end gap-1 text-[11px] font-medium text-slate-500">
                {user.role === "ADMIN" ? (
                  <span className="flex items-center gap-1 rounded-sm bg-purple-50 px-1.5 py-0.5 text-purple-600 font-mono text-[9px] uppercase font-bold">
                    <Shield className="h-2.5 w-2.5" /> {user.role}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-sm bg-emerald-50 px-1.5 py-0.5 text-emerald-600 font-mono text-[9px] uppercase font-bold">
                    <Award className="h-2.5 w-2.5" /> STUDENT
                  </span>
                )}
              </span>
            </div>

            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2"
            />
            
            <button
              id="header_logout_btn"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-medium text-teal-600 font-mono">
            <Sparkles className="h-4.5 w-4.5 animate-pulse text-yellow-500" /> Matrix Gate Open
          </div>
        )}
      </div>
    </header>
  );
}
