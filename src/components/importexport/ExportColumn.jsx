import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { base44 } from "@/api/base44Client";
import { format, addMonths, isBefore } from "date-fns";

const inputCls = "h-9 text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-0";

const REPORT_TYPES = [
  { value: "master", label: "Employee Master Data" },
  { value: "leave_balances", label: "Leave Balances Summary" },
  { value: "leave_transactions", label: "Leave Transactions", needsDateRange: true },
  { value: "compliance", label: "Compliance Report (Leave Cycle Warnings)" },
];

function downloadFile(data, filename, format) {
  if (format === "csv") {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename + ".csv"; a.click();
  } else {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename + ".xlsx");
  }
}

export default function ExportColumn() {
  const [reportType, setReportType] = useState("");
  const [fileFormat, setFileFormat] = useState("xlsx");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState(false);

  const selected = REPORT_TYPES.find(r => r.value === reportType);
  const needsDates = selected?.needsDateRange;

  const generate = async () => {
    setGenerating(true);
    const today = format(new Date(), "yyyy-MM-dd");

    if (reportType === "master") {
      const employees = await base44.entities.Employee.list("-created_date", 500);
      const rows = employees.map(e => ({
        "Employee Number": e.employee_number || "",
        "First Name": e.name || "",
        "Last Name": e.surname || "",
        "Email": e.email || "",
        "Contact Number": e.contact_number || "",
        "ID Number": e.id_number || "",
        "Department": e.department || "",
        "Job Title": e.job_title || "",
        "Start Date": e.start_date || "",
        "Work Week Type": e.work_week_type || "",
        "Employment Status": e.employment_status || "",
        "Annual Leave Cycle Start": e.annual_leave_cycle_start || "",
        "Sick Leave Cycle Start": e.sick_leave_cycle_start || "",
        "Custom Annual Leave Days": e.custom_annual_leave_days ?? "",
        "Residential Address": e.residential_address || "",
        "Bank Name": e.bank_name || "",
        "Branch Code": e.branch_code || "",
        "Account Number": e.account_number || "",
        "Next of Kin": e.next_of_kin_name || "",
        "Next of Kin Contact": e.next_of_kin_contact || "",
        "Termination Date": e.termination_date || "",
        "Termination Reason": e.termination_reason || "",
      }));
      downloadFile(rows, `employee_master_${today}`, fileFormat);
    }

    if (reportType === "leave_balances") {
      const year = new Date().getFullYear();
      const [employees, balances] = await Promise.all([
        base44.entities.Employee.list("-name", 500),
        base44.entities.LeaveBalance.filter({ year }, "-created_date", 500),
      ]);
      const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
      const rows = balances.map(b => {
        const emp = empMap[b.employee] || {};
        return {
          "Employee": `${emp.name || ""} ${emp.surname || ""}`.trim(),
          "Employee Number": emp.employee_number || "",
          "Year": b.year,
          "Annual Leave Accrued": b.annual_leave_accrued ?? "",
          "Annual Leave Taken": b.annual_leave_taken ?? "",
          "Annual Leave Balance": b.annual_leave_balance ?? "",
          "Annual Leave Forfeited": b.annual_leave_forfeited ?? "",
          "Family Resp. Total": b.family_responsibility_total ?? "",
          "Family Resp. Taken": b.family_responsibility_taken ?? "",
          "Family Resp. Balance": b.family_responsibility_balance ?? "",
          "Sick Leave Entitlement": b.sick_leave_entitlement ?? "",
          "Sick Leave Taken": b.sick_leave_taken_this_cycle ?? "",
          "Sick Leave Balance": b.sick_leave_balance ?? "",
          "Sick Leave Cycle Start": b.sick_leave_cycle_start || "",
        };
      });
      downloadFile(rows, `leave_balances_${year}`, fileFormat);
    }

    if (reportType === "leave_transactions") {
      const [employees, records] = await Promise.all([
        base44.entities.Employee.list("-name", 500),
        base44.entities.LeaveRecord.list("-start_date", 1000),
      ]);
      const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
      let filtered = records;
      if (dateFrom) filtered = filtered.filter(r => r.start_date >= dateFrom);
      if (dateTo) filtered = filtered.filter(r => r.start_date <= dateTo);
      const rows = filtered.map(r => {
        const emp = empMap[r.employee] || {};
        return {
          "Employee": `${emp.name || ""} ${emp.surname || ""}`.trim(),
          "Employee Number": emp.employee_number || "",
          "Leave Type": r.leave_type || "",
          "Start Date": r.start_date || "",
          "End Date": r.end_date || "",
          "Days Requested": r.days_requested ?? "",
          "Status": r.status || "",
          "Reason": r.reason || "",
          "Approved By": r.approved_by || "",
          "Approved Date": r.approved_date || "",
          "Approval Notes": r.approval_notes || "",
        };
      });
      downloadFile(rows, `leave_transactions_${dateFrom || "all"}_to_${dateTo || "all"}`, fileFormat);
    }

    if (reportType === "compliance") {
      const [employees, balances] = await Promise.all([
        base44.entities.Employee.list("-name", 500),
        base44.entities.LeaveBalance.filter({ year: new Date().getFullYear() }, "-created_date", 500),
      ]);
      const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
      const rows = [];
      balances.forEach(b => {
        const emp = empMap[b.employee] || {};
        const warnings = [];

        // Low annual leave
        if (b.annual_leave_balance !== undefined && b.annual_leave_balance < 3) {
          warnings.push("Low annual leave balance (<3 days)");
        }

        // Forfeiture risk: cycle end + 6 months
        if (b.sick_leave_cycle_start) {
          const cycleEnd = addMonths(new Date(b.sick_leave_cycle_start), 36);
          const forfeitDate = addMonths(cycleEnd, 6);
          if (isBefore(forfeitDate, addMonths(new Date(), 3))) {
            warnings.push(`Leave forfeiture risk by ${format(forfeitDate, "d MMM yyyy")}`);
          }
        }

        // Unused family resp
        if (new Date().getMonth() === 11 && b.family_responsibility_balance > 0) {
          warnings.push(`${b.family_responsibility_balance} unused family responsibility days expire Dec 31`);
        }

        if (warnings.length) {
          rows.push({
            "Employee": `${emp.name || ""} ${emp.surname || ""}`.trim(),
            "Employee Number": emp.employee_number || "",
            "Department": emp.department || "",
            "Annual Leave Balance": b.annual_leave_balance ?? "",
            "Sick Leave Balance": b.sick_leave_balance ?? "",
            "Family Resp. Balance": b.family_responsibility_balance ?? "",
            "Warnings": warnings.join("; "),
            "Report Date": today,
          });
        }
      });
      downloadFile(rows.length ? rows : [{ "Message": "No compliance issues found." }], `compliance_report_${today}`, fileFormat);
    }

    setGenerating(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-white">Export Reports</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Generate and download employee and leave reports</p>
      </div>

      {/* Report type */}
      <div>
        <Label className="text-xs text-zinc-400 mb-1.5 block">Report Type *</Label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className={inputCls}><SelectValue placeholder="Select a report…" /></SelectTrigger>
          <SelectContent>
            {REPORT_TYPES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Date range */}
      {needsDates && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">From Date</Label>
            <Input className={inputCls} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">To Date</Label>
            <Input className={inputCls} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      )}

      {/* Format */}
      <div>
        <Label className="text-xs text-zinc-400 mb-1.5 block">File Format</Label>
        <div className="flex gap-2">
          {["xlsx", "csv"].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFileFormat(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                fileFormat === f
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* What's included preview */}
      {reportType && (
        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-3 text-xs text-zinc-400 space-y-1">
          <p className="font-medium text-zinc-300 mb-1">Includes:</p>
          {reportType === "master" && <p>All employee records with personal, employment, banking, and next of kin details.</p>}
          {reportType === "leave_balances" && <p>Annual, sick, and family responsibility leave balances for {new Date().getFullYear()}.</p>}
          {reportType === "leave_transactions" && <p>All leave applications{dateFrom || dateTo ? ` between ${dateFrom || "start"} and ${dateTo || "now"}` : " (all time)"}.</p>}
          {reportType === "compliance" && <p>Employees with low balances, forfeiture risks, or expiring entitlements.</p>}
        </div>
      )}

      <Button
        onClick={generate}
        disabled={!reportType || generating}
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm disabled:opacity-50"
      >
        {generating
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating…</>
          : <><Download className="w-4 h-4 mr-2" />Generate & Download</>
        }
      </Button>
    </div>
  );
}