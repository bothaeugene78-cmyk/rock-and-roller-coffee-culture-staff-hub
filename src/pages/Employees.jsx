import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Users } from "lucide-react";
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

  const activeCount = employees.filter(e => e.employment_status !== "Terminated").length;
  const terminatedCount = employees.filter(e => e.employment_status === "Terminated").length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Employees</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeCount} active · {terminatedCount} terminated
            </p>
          </div>
          <Button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm gap-2"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="pl-9 h-9 text-sm border-gray-200 rounded-xl bg-white"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="w-10 h-10 mb-3 text-gray-200" />
            <p className="text-sm font-medium">No employees found</p>
            <p className="text-xs mt-1">Add your first employee to get started.</p>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-semibold text-gray-900">
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Remove employee?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              This will permanently delete <strong>{deleteTarget?.name} {deleteTarget?.surname}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl text-sm bg-rose-500 hover:bg-rose-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}