import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, CalendarDays, AlertTriangle, CheckCircle2, Clock, TrendingUp, FileSpreadsheet, BookOpen, Bot, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";

function StatCard({ icon: Icon, label, value, sub, color = "red" }) {
  const colors = {
    red: "text-red-400 bg-red-950/40 border-red-800/30",
    green: "text-emerald-400 bg-emerald-950/40 border-emerald-800/30",
    amber: "text-amber-400 bg-amber-950/40 border-amber-800/30",
    blue: "text-blue-400 bg-blue-950/40 border-blue-800/30",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-zinc-800/60">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-zinc-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value ?? "—"}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, desc }) {
  return (
    <Link
      to={createPageUrl(to)}
      className="flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-all group"
    >
      <div className="p-2.5 bg-red-600/20 rounded-xl group-hover:bg-red-600/30 transition-colors">
        <Icon className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
    </Link>
  );
}

const STATUS_COLORS = {
  Pending: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  Approved: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  Rejected: "bg-red-900/40 text-red-300 border-red-700/50",
};

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [emps, leaves] = await Promise.all([
      base44.entities.Employee.list(),
      base44.entities.LeaveRecord.list("-created_date", 50),
    ]);
    setEmployees(emps);
    setLeaveRecords(leaves);
    setLoading(false);
  };

  const activeCount = employees.filter(e => e.employment_status === "Active").length;
  const onLeaveCount = employees.filter(e => e.employment_status === "On Leave").length;
  const pendingLeave = leaveRecords.filter(r => r.status === "Pending").length;
  const recentPending = leaveRecords.filter(r => r.status === "Pending").slice(0, 8);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{format(new Date(), "EEEE, d MMMM yyyy")} · Full system overview</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Employees" value={loading ? "…" : employees.length} sub="All records" color="blue" />
          <StatCard icon={UserCheck} label="Active" value={loading ? "…" : activeCount} sub="Currently working" color="green" />
          <StatCard icon={CalendarDays} label="On Leave" value={loading ? "…" : onLeaveCount} sub="Currently on leave" color="amber" />
          <StatCard icon={Clock} label="Pending Leave" value={loading ? "…" : pendingLeave} sub="Awaiting approval" color="red" />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickLink to="Employees" icon={Users} label="Employees" desc="Manage all staff records" />
            <QuickLink to="DataImportExport" icon={FileSpreadsheet} label="Import / Export" desc="Bulk data operations" />
            <QuickLink to="LabourLaw" icon={BookOpen} label="Labour Law" desc="SA legislation reference" />
            <QuickLink to="LabourLawAssistant" icon={Bot} label="AI Assistant" desc="Labour law Q&A" />
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Pending Leave Requests</h2>
            {pendingLeave > 0 && (
              <span className="text-xs bg-red-600/20 text-red-400 border border-red-700/40 rounded-full px-2.5 py-0.5">
                {pendingLeave} pending
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600 gap-2">
              <CheckCircle2 className="w-8 h-8" />
              <p className="text-sm">No pending leave requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-500 font-medium pb-2 pr-4">Employee</th>
                    <th className="text-left text-zinc-500 font-medium pb-2 pr-4">Type</th>
                    <th className="text-left text-zinc-500 font-medium pb-2 pr-4">Dates</th>
                    <th className="text-left text-zinc-500 font-medium pb-2 pr-4">Days</th>
                    <th className="text-left text-zinc-500 font-medium pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {recentPending.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 pr-4 text-zinc-300 font-medium">{r.employee}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{r.leave_type}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">
                        {r.start_date} → {r.end_date}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400">{r.days_requested}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[r.status] || "text-zinc-400"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}