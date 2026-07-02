import { motion } from 'framer-motion';
import { BookOpen, Tag, Layers, Image, Users, ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import AdminPageState from '../../components/admin/AdminPageState';
import { GOLD_SOLID } from '../../constants/adminConstants';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { getApiError } from '../../lib/apiError';

const STATUS_STYLES = {
  none: { bg: '#6b728022', color: '#6b7280', label: 'Not submitted' },
  pending: { bg: '#d9770622', color: '#d97706', label: 'Pending' },
  approved: { bg: '#16a34a22', color: '#16a34a', label: 'Approved' },
  rejected: { bg: '#dc262622', color: '#dc2626', label: 'Rejected' },
};

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

export default function AdminDashboard({ onOpenVerifications }) {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  return (
    <AdminPageState
      isLoading={isLoading}
      isError={isError || !data}
      error={getApiError(error, 'Failed to load dashboard stats.')}
      onRetry={refetch}
    >
      <DashboardContent data={data} onOpenVerifications={onOpenVerifications} />
    </AdminPageState>
  );
}

function DashboardContent({ data, onOpenVerifications }) {
  const categoryTotal = (data.byCategory || []).reduce((sum, c) => sum + c.count, 0);
  const recentUsers = data.recentUsers || [];

  const statCards = [
    {
      icon: Users,
      label: 'Registered Users',
      te: 'నమోదైన వినియోగదారులు',
      value: data.totalUsers ?? 0,
      detail: 'Who signed up & logged in',
      bg: '#3b82f622',
      color: '#2563eb',
    },
    {
      icon: ShieldCheck,
      label: 'Pending Verifications',
      te: 'పరిశీలనలో',
      value: data.pendingVerifications ?? 0,
      detail: `${data.approvedVerifications ?? 0} approved`,
      bg: '#d9770622',
      color: '#d97706',
      action: onOpenVerifications,
    },
    {
      icon: BookOpen,
      label: 'Scriptures',
      value: data.totalScriptures ?? 0,
      detail: data.totalVerses != null ? `${data.totalVerses} verses` : null,
      bg: '#E4B24B22',
      color: GOLD_SOLID,
    },
    {
      icon: Image,
      label: 'Images',
      value: data.totalImages ?? 0,
      detail: data.totalImageAlbums != null ? `${data.totalImageAlbums} albums` : null,
      bg: '#f43f5e22',
      color: '#e11d48',
    },
    { icon: Tag, label: 'Categories', value: data.totalCategories ?? 0, bg: '#a855f722', color: '#9333ea' },
    { icon: Layers, label: 'Subcategories', value: data.totalSubcategories ?? 0, bg: '#0d948822', color: '#0d9488' },
  ];

  const byCategory = data.byCategory || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-telugu text-xl font-bold gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
          డాష్‌బోర్డ్
        </h1>
        <p className="text-sm text-muted mt-0.5">Overview of users, verifications, and content</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const Wrapper = card.action ? 'button' : 'div';
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Wrapper
                type={card.action ? 'button' : undefined}
                onClick={card.action}
                className={`corner-card rounded-2xl p-5 w-full text-left ${card.action ? 'hover:ring-1 hover:ring-[#C88F2D44] transition-all cursor-pointer' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: card.bg, border: '1px solid #C88F2D22' }}>
                  <Icon size={20} color={card.color} />
                </div>
                <p className="text-2xl font-bold tabular-nums gold-glow">{card.value}</p>
                <p className="text-xs text-muted mt-0.5 font-semibold">{card.label}</p>
                {card.te && (
                  <p className="text-[10px] text-muted font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>{card.te}</p>
                )}
                {card.detail ? <p className="text-[10px] text-muted-light mt-1">{card.detail}</p> : null}
                {card.action && (data.pendingVerifications ?? 0) > 0 && (
                  <p className="text-[10px] text-[#d97706] mt-2 flex items-center gap-1 font-semibold">
                    Review now <ChevronRight size={12} />
                  </p>
                )}
              </Wrapper>
            </motion.div>
          );
        })}
      </div>

      <div className="corner-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h3 className="font-bold text-sm gold-glow flex items-center gap-2">
              <Users size={16} /> Recent Logins
            </h3>
            <p className="text-[11px] text-muted mt-0.5 font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              లాగిన్ అయిన వినియోగదారులు
            </p>
          </div>
          <span className="text-xs text-muted tabular-nums">{recentUsers.length} shown</span>
        </div>

        {recentUsers.length === 0 ? (
          <p className="p-6 text-sm text-muted text-center">No registered users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-muted border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-3 py-3 font-semibold hidden sm:table-cell">Username</th>
                  <th className="px-3 py-3 font-semibold">Verification</th>
                  <th className="px-3 py-3 font-semibold hidden md:table-cell">Last Login</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
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
                    <td className="px-3 py-3 text-xs text-muted hidden md:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {formatWhen(user.last_login_at)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted hidden lg:table-cell">
                      {formatWhen(user.joined_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="corner-card rounded-2xl p-5">
        <h3 className="font-bold text-sm gold-glow mb-4">Scriptures by Category</h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-muted">No scriptures yet. Add some from the Scriptures tab.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map((c) => {
              const pct = categoryTotal
                ? Math.round((c.count / categoryTotal) * 100)
                : 0;
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted"
                      style={{ fontFamily: 'Tiro Telugu, serif' }}>
                      {c.label} <span className="text-muted-light font-normal">({c.label_en})</span>
                    </span>
                    <span className="text-xs text-muted tabular-nums">{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#222' }}>
                    <motion.div className={`h-full rounded-full bg-gradient-to-r ${c.color}`}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
