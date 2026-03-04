import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, CalendarDays } from "lucide-react";

export default function StatsCards({ employees }) {
  const total = employees.length;
  const active = employees.filter((e) => e.employment_status !== "Terminated").length;
  const terminated = total - active;
  const avgLeave =
    active > 0
      ? (
          employees
            .filter((e) => e.employment_status !== "Terminated")
            .reduce((sum, e) => sum + (e.leave_days_due || 15), 0) / active
        ).toFixed(1)
      : 0;

  const stats = [
    { label: "Total Employees", value: total, icon: Users, color: "bg-slate-100 text-slate-600" },
    { label: "Active", value: active, icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Terminated", value: terminated, icon: UserX, color: "bg-rose-50 text-rose-600" },
    { label: "Avg Leave Days", value: avgLeave, icon: CalendarDays, color: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-5 border-0 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}