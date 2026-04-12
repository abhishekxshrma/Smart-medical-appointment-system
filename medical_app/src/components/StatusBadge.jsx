const config = {
  waiting: {
    label: "Waiting",
    classes: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  "in-progress": {
    label: "In Progress",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500 animate-pulse",
  },
  completed: {
    label: "Completed",
    classes: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export default function StatusBadge({ status }) {
  const s = config[status] || config.waiting;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}