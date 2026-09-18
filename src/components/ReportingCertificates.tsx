import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { 
  Award, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Search, 
  HelpCircle,
  FileCheck2,
  Lock
} from "lucide-react";

export function ReportingCertificates() {
  const { certificates } = useSelector((state: RootState) => state.quiz);
  const { token } = useSelector((state: RootState) => state.auth);

  // Verification states
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyErr, setVerifyErr] = useState<string | null>(null);

  // Download simulation loading states
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode) return;
    try {
      setVerifying(true);
      setVerifyErr(null);
      setVerifyResult(null);

      const res = await fetch(`/api/certificates/verify/${verifyCode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      
      setVerifyResult(data.certificate);
    } catch (err: any) {
      setVerifyErr(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setDownloadingCsv(true);
      // Calls our real backend endpoint returning a downloadable CSV!
      const response = await fetch("/api/reports/export?type=csv", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LearnMatrix_Export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Csv export error:", err);
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Credentials & Business Intelligence Reports</h2>
        <p className="text-sm text-slate-500 font-medium">Claim certifications, retrieve dynamic PDF audits, and export executive tables.</p>
      </div>

      {/* Dynamic Certifications listing */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /> Issued Certifications</h3>
        
        {certificates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/40">
            <Lock className="mx-auto h-8 w-8 text-gray-300" />
            <h4 className="mt-2 text-sm font-bold text-gray-600">No Certificates Earned Yet</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Complete a curriculum course evaluation quiz with a passing score of 70% or more to issue a digital credential.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                className="rounded-3xl border-2 border-amber-100 bg-amber-50/10 p-6 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-24 w-24 rounded-full bg-amber-100/30 rotate-12 flex items-center justify-center font-serif text-[100px] text-amber-200 opacity-20 hover:scale-110 transition-transform">
                  ★
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Award className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">SECURE DIGITAL</span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono tracking-widest text-amber-700 font-black uppercase">LearnMatrix Certified Professional</span>
                    <h4 className="text-base font-black text-amber-950">{cert.courseTitle}</h4>
                    <p className="text-xs text-amber-800/80 leading-normal">Granted with honors to <strong>{cert.userName}</strong> on {cert.issuedAt.split("T")[0]} standard UTC time.</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-amber-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="block text-[9px] font-mono text-amber-700 font-black uppercase">Credential Verification Id</span>
                    <span className="block font-mono text-[10px] text-slate-600 font-bold mt-0.5">{cert.verificationCode}</span>
                  </div>

                  {/* PDF download simulated print triggers */}
                  <button
                    onClick={() => window.print()}
                    className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF Download Certificate
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verification portal */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5"><FileCheck2 className="h-4.5 w-4.5 text-emerald-500" /> Certificate Registry Verification</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Query our secure blockchain ledger registry by verification code to verify authenticity factors.</p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Ex: LM-KTJ8L-PX82..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                required
              />
            </div>

            <button
               type="submit"
               disabled={verifying}
               className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              {verifying ? "Querying registry..." : "Verify Certificate Authentic"}
            </button>
          </form>

          {verifyErr && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-bold border border-red-100">
              {verifyErr}
            </div>
          )}

          {verifyResult && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 fill-emerald-50" /> Credential Verified Authentic
              </div>
              <ul className="text-[11px] text-emerald-700 leading-6 font-mono select-text">
                <li>Professional Name: {verifyResult.userName}</li>
                <li>Certified Domain: {verifyResult.courseTitle}</li>
                <li>Issued On: {verifyResult.issuedAt?.split("T")[0]}</li>
              </ul>
            </div>
          )}
        </div>

        {/* BI Export Panel */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5"><FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" /> Executive BI Exports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Extract full student enrollment milestones reports, hourly logs, pass percentages, and dynamic dashboard metrics into CSV format keys.</p>
          </div>

          <div className="pt-4 flex flex-wrap gap-2">
            <button
              id="bi_export_csv_btn"
              onClick={handleExportCsv}
              disabled={downloadingCsv}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" /> {downloadingCsv ? "Exporting CSV..." : "Export CSV Report"}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
