import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Users, Download, Share2 } from "lucide-react";
import * as XLSX from "xlsx";
import EmployeeCard from "../components/employees/EmployeeCard";
import EmployeeForm from "../components/employees/EmployeeForm";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Employee.list("-created_date");
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.surname?.toLowerCase().includes(q) ||
      e.id_number?.includes(q)
    );
  });

  const handleSave = async (form) => {
    setSaving(true);
    if (editTarget) {
      await base44.entities.Employee.update(editTarget.id, form);
    } else {
      await base44.entities.Employee.create(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditTarget(null);
    load();
  };

  const handleEdit = (emp) => {
    setEditTarget(emp);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await base44.entities.Employee.delete(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const exportToExcel = () => {
    const rows = employees.map(e => ({
      "First Name": e.name,
      "Surname": e.surname,
      "ID Number": e.id_number,
      "Contact Number": e.contact_number,
      "Residential Address": e.residential_address,
      "Start Date": e.start_date,
      "Leave Days Due": e.leave_days_due,
      "Bank Name": e.bank_name,
      "Branch Code": e.branch_code,
      "Account Number": e.account_number,
      "IT Number": e.it_number,
      "Next of Kin Name": e.next_of_kin_name,
      "Next of Kin Relationship": e.next_of_kin_relationship,
      "Next of Kin Contact": e.next_of_kin_contact,
      "Employment Status": e.employment_status,
      "Termination Date": e.termination_date,
      "Termination Reason": e.termination_reason,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employees.xlsx");
  };

  const activeCount = employees.filter(e => e.employment_status !== "Terminated").length;
  const terminatedCount = employees.filter(e => e.employment_status === "Terminated").length;

  const sendWhatsApp = () => {
    const appUrl = window.location.origin;
    const registrationLink = `${appUrl}/employee-registration`;
    const message = `Hi! 👋 Please complete your employee registration using the link below:\n\n📝 *Registration Form:*\n${registrationLink}\n\n📱 *Download the App:*\nOn your phone, open the link above in your browser, then tap the menu and select "Add to Home Screen" to install the app.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Employees</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              <span className="text-emerald-500">{activeCount} active</span> · <span className="text-zinc-400">{terminatedCount} terminated</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={sendWhatsApp}
              className="rounded-xl text-sm gap-2 border-zinc-700 bg-zinc-800 text-green-400 hover:text-green-300 hover:border-green-700 hover:bg-zinc-700"
            >
              <Share2 className="w-4 h-4" /> Invite via WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={exportToExcel}
              className="rounded-xl text-sm gap-2 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              <Download className="w-4 h-4" /> Export to Excel
            </Button>
            <Button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm gap-2 shadow-lg shadow-red-900/30"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="pl-9 h-9 text-sm border-zinc-700 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-500 focus:border-red-600 focus:ring-0"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-44 bg-zinc-800 rounded-2xl border border-zinc-700 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Users className="w-10 h-10 mb-3 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-400">No employees found</p>
            <p className="text-xs mt-1 text-zinc-600">Add your first employee to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(emp => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) { setShowForm(false); setEditTarget(null); }}}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-zinc-900 border border-zinc-700 text-white">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-semibold text-white">
              {editTarget ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initial={editTarget || {}}
            onSubmit={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
            loading={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl bg-zinc-900 border border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base text-white">Remove employee?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-zinc-400">
              This will permanently delete <strong className="text-white">{deleteTarget?.name} {deleteTarget?.surname}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-sm border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl text-sm bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}