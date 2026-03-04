import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <Badge
      className={
        isActive
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
          : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50"
      }
    >
      {isActive ? (
        <CheckCircle2 className="w-3 h-3 mr-1" />
      ) : (
        <XCircle className="w-3 h-3 mr-1" />
      )}
      {status || "Active"}
    </Badge>
  );
}