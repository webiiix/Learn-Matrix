import React from "react";
import { Sparkles, BrainCircuit, ShieldAlert, Award, FileSpreadsheet, ArrowRight, BookOpen, Layers } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col justify-between select-none">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-mono font-bold tracking-wider text-emerald-800 uppercase animate-pulse">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Next-generation LMS Matrix
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
          Empower Tech Training alignment with <span className="text-transparent bg-gradient-to-r from-slate-900 to-emerald-600 bg-clip-text">LEARNMATRIX</span>
        </h1>

        <p className="max-w-2xl text-slate-500 text-sm md:text-base leading-relaxed font-medium">
          The ultimate full-stack learning platform tracking system. Master complex typings, verify neural network structures, and unlock secure digital blockchain credentials.
        </p>

        <div className="pt-4 flex flex-wrap gap-3 justify-center">
          <button
            id="landing_start_btn"
            onClick={onStart}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 text-xs tracking-wide shadow-md flex items-center gap-2 group transition-all cursor-pointer"
          >
            Access Core Workspace 
            <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl w-full text-left">
          
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-551">
              <BrainCircuit className="h-5.5 w-5.5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">AI-Ready Advisories</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Algorithmic recommendation engine mapping scores into automatic study guides based on pass metrics.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-551">
              <Award className="h-5.5 w-5.5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Secure Cryptic Certs</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Automated credentials with private keys verification registries ensuring certified professional statuses.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-551">
              <FileSpreadsheet className="h-5.5 w-5.5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Executive Reports</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">BI metrics tracking complete study hours, streaks indexes, trend comparative lines, and downloadable lists.</p>
            </div>
          </div>

        </div>

      </div>

      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-450 font-medium">
        © 2026 LearnMatrix Platforms Inc. Deployed fully serverless on secure Sandboxes.
      </footer>

    </div>
  );
}
