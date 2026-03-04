import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import StatsCards from "../components/employees/StatsCards";
import EmployeeTable from "../components/employees/EmployeeTable";
import EmployeeForm from "../components/employees/EmployeeForm";
import EmployeeDetail from "../components/employees/EmployeeDetail";

export default function Employees() {
  const [view, setView] = useState("list"); // list | form | detail
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setView("list");
      setSelectedEmployee(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setView("list");
      setSelectedEmployee(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setView("list");
      setSelectedEmployee(null);
      setDeleteTarget(null);
    },
  });

  const handleSave = (data) => {
    if (selectedEmployee?.id) {
      updateMutation.mutate({ id: selectedEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = employees.filter((e) => {
    const matchesSearch =
      !search ||
      `${e.name} ${e.surname} ${e.id_number} ${e.contact_number}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Active" && e.employment_status !== "Terminated") ||
      (statusFilter === "Terminated" && e.employment_status === "Terminated");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Employees</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your workforce records</p>
          </div>
          {view === "list" && (
            <Button
              onClick={() => { setSelectedEmployee(null); setView("form"); }}
              className="bg-slate-800 hover:bg-slate-900 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Employee
            </Button>
          )}
        </div>

        {view === "list" && (
          <>
            <StatsCards employees={employees} />

            <Card className="mt-6 border-0 shadow-sm">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    placeholder="Search by name, ID, or contact..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-slate-50/50 border-slate-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 h-10 bg-slate-50/50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300" />
                </div>
              ) : (
                <EmployeeTable
                  employees={filtered}
                  onView={(emp) => { setSelectedEmployee(emp); setView("detail"); }}
                  onEdit={(emp) => { setSelectedEmployee(emp); setView("form"); }}
                />
              )}
            </Card>
          </>
        )}

        {view === "form" && (
          <EmployeeForm
            employee={selectedEmployee}
            onSave={handleSave}
            onCancel={() => { setView(selectedEmployee ? "detail" : "list"); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {view === "detail" && selectedEmployee && (
          <EmployeeDetail
            employee={selectedEmployee}
            onEdit={() => setView("form")}
            onBack={() => { setView("list"); setSelectedEmployee(null); }}
            onDelete={() => setDeleteTarget(selectedEmployee)}
          />
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.name} {deleteTarget?.surname}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}