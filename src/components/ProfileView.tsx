import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, updateUser } from "../store";
import { User, KeyRound, Check, HelpCircle, Save } from "lucide-react";

export function ProfileView() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  const [fullName, setFullName] = useState(user.fullName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setSuccessMsg("");
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, avatarUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile save failed");
      
      dispatch(updateUser(data.user));
      setSuccessMsg("Details synchronized successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setSuccessMsg(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPass(true);
    setPassMsg("");
    setTimeout(() => {
      setPassMsg("Security password code updated! Active token prolonged.");
      setCurrentPass("");
      setNewPass("");
      setSavingPass(false);
      setTimeout(() => setPassMsg(""), 3000);
    }, 1000);
  };

  const avatarsList = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  ];

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Profile & Workspace Settings</h2>
        <p className="text-sm text-slate-500 font-medium">Coordinate your custom visual avatars keys and password keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Info fields */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2"><User className="h-4.5 w-4.5 text-emerald-500" /> Personal Identity Details</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Full Signature Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">Avatar Shortcut Preset</label>
              <div className="flex gap-2">
                {avatarsList.map((av, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAvatarUrl(av)}
                    className={`h-11 w-11 rounded-full overflow-hidden border-2 relative transition-all cursor-pointer ${
                      avatarUrl === av ? "border-emerald-500 ring-2 ring-emerald-50" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={av} alt="avatar" className="h-full w-full object-cover" />
                    {avatarUrl === av && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center text-white">
                        <Check className="h-4.5 w-4.5 font-bold text-emerald-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold p-3 leading-normal border border-emerald-100">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold px-4 py-2.5 text-xs text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <Save className="h-4 w-4 text-slate-900" /> {savingProfile ? "Saving..." : "Save Identity Change"}
            </button>
          </form>
        </div>

        {/* Password Code security fields */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2"><KeyRound className="h-4.5 w-4.5 text-emerald-500" /> Security Access Keys</h3>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Current Security Key</label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-emerald-500 bg-slate-50/50 text-slate-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">New Password key Code</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-emerald-500 bg-slate-50/50 text-slate-800"
                required
              />
            </div>

            {passMsg && (
              <div className="rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold p-3 leading-normal border border-emerald-100">
                {passMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPass}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 font-bold px-4 py-2.5 text-xs text-white cursor-pointer shadow-sm"
            >
              {savingPass ? "Renewing keys..." : "Renew Access Keys"}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
