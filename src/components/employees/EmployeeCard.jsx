import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function EmployeeCard({ employee, onEdit, onDelete }) {
  const isActive = employee.employment_status !== "Terminated";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0">
            {employee.name?.[0]}{employee.surname?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              {employee.name} {employee.surname}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">ID: {employee.id_number}</p>
          </div>
        </div>
        <Badge
          className={`text-xs shrink-0 rounded-lg px-2.5 py-0.5 font-medium border-0 ${
            isActive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-500"
          }`}
        >
          {employee.employment_status || "Active"}
        </Badge>
      </div>

      <div className="space-y-1.5">
        {employee.contact_number && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone className="w-3.5 h-3.5 text-gray-300" />
            {employee.contact_number}
          </div>
        )}
        {employee.residential_address && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-300" />
            <span className="truncate">{employee.residential_address}</span>
          </div>
        )}
        {employee.start_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-300" />
            Started {format(new Date(employee.start_date), "d MMM yyyy")}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {employee.leave_days_due ?? 15} leave days
        </span>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-gray-400 hover:text-gray-700 rounded-lg"
            onClick={() => onEdit(employee)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-gray-400 hover:text-rose-500 rounded-lg"
            onClick={() => onDelete(employee)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}