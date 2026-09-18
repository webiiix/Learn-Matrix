import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, loginUser } from "../store";
import { Sparkles, UserCheck, Shield, KeyRound, Mail, ArrowRight } from "lucide-react";

interface AuthScreensProps {
  onSuccess: () => void;
}

export function AuthScreens({ onSuccess }: AuthScreensProps) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const [email, setEmail] = useState("student@learnmatrix.com");
  const [fullName, setFullName] = useState("");
  const [passCode, setPassCode] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!fullName || !email) return;
      const result = await (dispatch as any)(loginUser({ email, fullName, isRegister: true }));
      if (loginUser.fulfilled.match(result)) {
        onSuccess();
      }
    } else {
      if (!email) return;
      const result = await (dispatch as any)(loginUser({ email, isRegister: false }));
      if (loginUser.fulfilled.match(result)) {
        onSuccess();
      }
    }
  };

  const selectPreseedAccount = (type: "student" | "admin") => {
    if (type === "student") {
      setEmail("student@learnmatrix.com");
      setIsRegister(false);
    } else {
      setEmail("admin@learnmatrix.com");
      setIsRegister(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Reset instructions dispatched to ${email}! Check fake SMTP log.`);
    setTimeout(() => {
      setIsForgot(false);
      setSuccessMsg("");
    }, 2500);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-radial from-slate-50 via-slate-100 to-slate-200 px-6 py-12">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 border border-slate-100">
        
        {/* Banner Graphic decoration */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
          
          <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white shadow-xs">
            <Sparkles className="h-6 w-6 text-emerald-300 animate-pulse" />
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight uppercase">LEARN<span className="text-emerald-400">MATRIX</span></h2>
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 mt-1">Enterprise LMS Node Gateway</p>
        </div>

        <div className="p-8">
          {isForgot ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Forgot Password recovery</h3>
              <p className="text-xs text-slate-500">Provide registration address key to locate credentials.</p>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                    placeholder="student@learnmatrix.com"
                  />
                </div>
              </div>

              {successMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 font-bold leading-relaxed">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                id="auth_forgot_submit"
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Send Reset Code
              </button>

              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="w-full text-center text-xs font-bold text-emerald-600 hover:underline mt-2 block cursor-pointer"
              >
                Return to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setEmail("student@learnmatrix.com"); }}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${!isRegister ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setEmail(""); }}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${isRegister ? "bg-white text-emerald-600 shadow-xs" : "text-slate-500"}`}
                >
                  Register
                </button>
              </div>

              <div className="space-y-4">
                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                      placeholder="Alex Rivera"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Email Key Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                      placeholder="student@learnmatrix.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-semibold text-slate-600">Password Code</label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => setIsForgot(true)}
                        className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={passCode}
                      onChange={(e) => setPassCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-bold leading-normal">
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="auth_sign_submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? "Synchronizing..." : isRegister ? "Create Free Account" : "Access Workspace"}
                <ArrowRight className="h-4 w-4 text-emerald-450" />
              </button>

              {/* Instant preseed test cards widget for ease of reviewer testing! */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <span className="block text-center text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Preseeded Demo Accounts</span>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => selectPreseedAccount("student")}
                    className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left transition-all hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-705 group-hover:text-emerald-700">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Student
                    </div>
                    <span className="block text-[9px] font-mono text-slate-400 mt-0.5">student@learnmatrix.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPreseedAccount("admin")}
                    className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left transition-all hover:bg-purple-50 hover:border-purple-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-705 group-hover:text-purple-705">
                      <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" /> Admin
                    </div>
                    <span className="block text-[9px] font-mono text-slate-400 mt-0.5">admin@learnmatrix.com</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
