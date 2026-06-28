export default function AdminBadge({ label, color }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${color}`}>
      {label}
    </span>
  );
}
