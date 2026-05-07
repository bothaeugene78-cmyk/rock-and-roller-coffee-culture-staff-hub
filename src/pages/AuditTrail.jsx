import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity } from "lucide-react";
import { format } from "date-fns";

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await base44.entities.AuditLog.list("-timestamp", 100);
    setLogs(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
        </div>

        {loading ? (
          <div className="text-zinc-400">Loading...</div>
        ) : (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Entity</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Changed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-300">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{log.entity_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.action === 'create' ? 'bg-emerald-900/40 text-emerald-300' :
                        log.action === 'update' ? 'bg-blue-900/40 text-blue-300' :
                        'bg-red-900/40 text-red-300'
                      }`}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{log.changed_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}