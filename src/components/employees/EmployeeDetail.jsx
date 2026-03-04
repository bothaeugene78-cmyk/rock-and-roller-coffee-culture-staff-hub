import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { User, Briefcase, Landmark, FileText, Heart, ShieldCheck, Pencil, ArrowLeft, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

const InfoRow = ({ label, value }) => (
  <div className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-0">
    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider sm:w-40 shrink-0">{label}</span>
    <span className="text-sm text-slate-700 font-medium">{value || "—"}</span>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="divide-y divide-slate-50">{children}</CardContent>
  </Card>
);

export default function EmployeeDetail({ employee, onEdit, onBack, onDelete }) {
  const e = employee;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
              {e.name?.[0]}{e.surname?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{e.name} {e.surname}</h2>
              <StatusBadge status={e.employment_status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section icon={User} title="Personal Information">
          <InfoRow label="Full Name" value={`${e.name} ${e.surname}`} />
          <InfoRow label="ID Number" value={e.id_number} />
          <InfoRow label="Contact" value={e.contact_number} />
          <InfoRow label="Address" value={e.residential_address} />
        </Section>

        <Section icon={Briefcase} title="Employment Details">
          <InfoRow label="Start Date" value={e.start_date ? format(new Date(e.start_date), "dd MMMM yyyy") : null} />
          <InfoRow label="Leave Days Due" value={e.leave_days_due ?? 15} />
        </Section>

        <Section icon={Landmark} title="Banking Details">
          <InfoRow label="Bank" value={e.bank_name} />
          <InfoRow label="Branch Code" value={e.branch_code} />
          <InfoRow label="Account No." value={e.account_number} />
        </Section>

        <Section icon={FileText} title="Tax Information">
          <InfoRow label="IT Number" value={e.it_number} />
        </Section>

        <Section icon={Heart} title="Next of Kin">
          <InfoRow label="Name" value={e.next_of_kin_name} />
          <InfoRow label="Relationship" value={e.next_of_kin_relationship} />
          <InfoRow label="Contact" value={e.next_of_kin_contact} />
        </Section>

        {e.employment_status === "Terminated" && (
          <Section icon={ShieldCheck} title="Termination Details">
            <InfoRow label="Date" value={e.termination_date ? format(new Date(e.termination_date), "dd MMMM yyyy") : null} />
            <InfoRow label="Reason" value={e.termination_reason} />
          </Section>
        )}
      </div>
    </div>
  );
}