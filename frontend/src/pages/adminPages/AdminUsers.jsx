import { useEffect, useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminPageState from '../../components/admin/AdminPageState';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { getApiError } from '../../lib/apiError';

const STATUS_STYLES = {
  none: { bg: '#6b728022', color: '#6b7280', label: 'Not submitted' },
  pending: { bg: '#d9770622', color: '#d97706', label: 'Pending' },
  approved: { bg: '#16a34a22', color: '#16a34a', label: 'Approved' },
  rejected: { bg: '#dc262622', color: '#dc2626', label: 'Rejected' },
};

const PAGE_SIZE = 20;

function UserStatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.none;
  return (
    <span
      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function formatWhen(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    q: debouncedSearch,
  });

  const users = data?.users || [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <AdminPageState
      isLoading={isLoading}
      isError={isError}
      error={getApiError(error, 'Failed to load users.')}
      onRetry={refetch}
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold gold-glow">Users</h1>
          <p className="text-sm text-muted mt-0.5">Registered users</p>
        </div>

        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username..."
            className="form-input pl-9 w-full"
          />
        </div>

        <div className="corner-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="font-bold text-sm gold-glow flex items-center gap-2">
                <Users size={16} /> All Users
              </h3>
            </div>
            <span className="text-xs text-muted tabular-nums">
              {total} total{isFetching && !isLoading ? ' · updating…' : ''}
            </span>
          </div>

          {users.length === 0 ? (
            <p className="p-6 text-sm text-muted text-center">
              {debouncedSearch ? 'No users match your search.' : 'No registered users yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-muted border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-3 py-3 font-semibold hidden sm:table-cell">Username</th>
                    <th className="px-3 py-3 font-semibold">Verification</th>
                    <th className="px-5 py-3 font-semibold hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-white/[0.02]" style={{ borderColor: 'var(--border-subtle)' }}>
                      <td className="px-5 py-3">
                        <p className="font-semibold font-telugu truncate max-w-[140px]" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                          {user.name}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-muted hidden sm:table-cell">@{user.username}</td>
                      <td className="px-3 py-3">
                        <UserStatusBadge status={user.verification_status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-muted hidden md:table-cell">
                        {formatWhen(user.joined_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-xs text-muted tabular-nums">
                Showing {rangeStart}–{rangeEnd} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold btn-ghost disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-xs text-muted tabular-nums min-w-[5rem] text-center">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold btn-ghost disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageState>
  );
}
