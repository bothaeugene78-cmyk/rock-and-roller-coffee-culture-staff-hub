import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

const actionColors = {
  create: "bg-emerald-100 text-emerald-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800"
};

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    const auditLogs = await base44.entities.AuditLog.list("-timestamp", 100);
    setLogs(auditLogs);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Audit Trail</h1>

        {loading ? (
          <p className="text-zinc-400">Loading audit logs...</p>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Entity</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Action</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Changed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-400">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 font-medium">{log.entity_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${actionColors[log.action]}`}>
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{log.changed_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="p-8 text-center text-zinc-500">No audit logs found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}