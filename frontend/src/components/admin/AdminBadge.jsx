export default function AdminBadge({ label, color, className = '' }) {
  return (
    <span
      className={`inline-flex items-center min-w-0 max-w-full px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${color} ${className}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
