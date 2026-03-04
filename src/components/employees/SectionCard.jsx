export default function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-gray-50/60">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}