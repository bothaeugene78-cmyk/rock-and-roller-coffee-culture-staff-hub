import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "./StatusBadge";

export default function EmployeeTable({ employees, onView, onEdit }) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-lg font-medium">No employees found</p>
        <p className="text-sm mt-1">Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100">
            <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</TableHead>
            <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ID Number</TableHead>
            <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Contact</TableHead>
            <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Start Date</TableHead>
            <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id} className="border-slate-50 hover:bg-slate-25 cursor-pointer" onClick={() => onView(emp)}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                    {emp.name?.[0]}{emp.surname?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{emp.name} {emp.surname}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-slate-500 font-mono text-sm">{emp.id_number}</TableCell>
              <TableCell className="text-slate-500 hidden md:table-cell">{emp.contact_number}</TableCell>
              <TableCell className="text-slate-500 hidden lg:table-cell">
                {emp.start_date ? format(new Date(emp.start_date), "dd MMM yyyy") : "—"}
              </TableCell>
              <TableCell>
                <StatusBadge status={emp.employment_status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={(e) => { e.stopPropagation(); onView(emp); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={(e) => { e.stopPropagation(); onEdit(emp); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}