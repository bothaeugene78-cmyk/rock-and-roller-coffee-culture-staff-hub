import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, Upload, AlertTriangle, Bell } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { format, addMonths } from "date-fns";
import LeaveStatCard from "../components/dashboard/LeaveStatCard";
import RecentLeaveTable from "../components/dashboard/RecentLeaveTable";
import LeaveApplicationModal from "../components/dashboard/LeaveApplicationModal";

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recentLeave, setRecentLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);

    // Find employee record by email
    const employees = await base44.entities.Employee.filter({ email: me.email });
    const emp = employees[0] || null;
    setEmployee(emp);

    if (emp) {
      // Fetch leave balance for current year
      const balances = await base44.entities.LeaveBalance.filter({ employee: emp.id, year: currentYear });
      setBalance(balances[0] || null);

      // Fetch last 5 leave records
      const leaves = await base44.entities.LeaveRecord.filter({ employee: emp.id }, "-created_date", 5);
      setRecentLeave(leaves);
    }

    setLoading(false);
  };

  const sickCycleEnd = balance?.sick_leave_cycle_start
    ? format(addMonths(new Date(balance.sick_leave_cycle_start), 36), "MMM yyyy")
    : "—";

  const firstName = user?.full_name?.split(" ")[0] || "there";

  const showLowLeaveWarning = balance && balance.annual_leave_balance !== undefined && balance.annual_leave_balance < 3;
  const showDecemberWarning = currentMonth === 12 && balance && balance.family_responsibility_balance > 0;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    alert(`Document uploaded successfully.\nURL: ${file_url}`);
    setUploadKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Welcome, <span className="text-red-500">{firstName}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Your leave dashboard · {format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Alerts */}
        {(showLowLeaveWarning || showDecemberWarning) && (
          <div className="space-y-2">
            {showLowLeaveWarning && (
              <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-300">Low Leave Balance</p>
                  <p className="text-xs text-red-400/80 mt-0.5">You have fewer than 3 annual leave days remaining. Plan ahead before your cycle ends.</p>
                </div>
              </div>
            )}
            {showDecemberWarning && (
              <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-800/50 rounded-xl px-4 py-3">
                <Bell className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Family Responsibility Leave Expires Soon</p>
                  <p className="text-xs text-amber-400/80 mt-0.5">You still have {balance.family_responsibility_balance} family responsibility day(s) — these reset on 31 December.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LeaveStatCard
            title="Annual Leave Available"
            value={balance?.annual_leave_balance ?? null}
            subtext={balance ? `of ${balance.annual_leave_accrued ?? "—"} accrued this cycle` : "No balance record found"}
            colorScheme="green"
            loading={loading}
          />
          <LeaveStatCard
            title="Family Responsibility Leave"
            value={balance?.family_responsibility_balance ?? null}
            subtext={`Resets 31 Dec ${currentYear}`}
            colorScheme="blue"
            loading={loading}
          />
          <LeaveStatCard
            title="Sick Leave Balance"
            value={balance?.sick_leave_balance ?? null}
            subtext={`Cycle ends ${sickCycleEnd}`}
            colorScheme="purple"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowLeaveModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm gap-2"
            >
              <CalendarDays className="w-4 h-4" /> Apply for Leave
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl text-sm gap-2 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              <Link to={createPageUrl("MyLeaveHistory")}>
                <FileText className="w-4 h-4" /> View My Leave History
              </Link>
            </Button>
            <label className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-sm gap-2 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                onClick={() => document.getElementById("doc-upload").click()}
              >
                <Upload className="w-4 h-4" /> Upload Document
              </Button>
              <input
                key={uploadKey}
                id="doc-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Recent Leave Activity</h2>
          <RecentLeaveTable records={recentLeave} loading={loading} />
        </div>

      </div>

      <LeaveApplicationModal
        open={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        employeeId={employee?.id}
        balance={balance}
        onSuccess={loadData}
      />
    </div>
  );
}