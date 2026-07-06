import { motion } from 'framer-motion';
import { BookOpen, Tag, Layers, Image, Users, ShieldCheck, ChevronRight } from 'lucide-react';
import AdminPageState from '../../components/admin/AdminPageState';
import { GOLD_SOLID } from '../../constants/adminConstants';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { getApiError } from '../../lib/apiError';

export default function AdminDashboard({ onOpenUsers, onOpenVerifications }) {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  return (
    <AdminPageState
      isLoading={isLoading}
      isError={isError || !data}
      error={getApiError(error, 'Failed to load dashboard stats.')}
      onRetry={refetch}
    >
      <DashboardContent data={data} onOpenUsers={onOpenUsers} onOpenVerifications={onOpenVerifications} />
    </AdminPageState>
  );
}

function DashboardContent({ data, onOpenUsers, onOpenVerifications }) {
  const categoryTotal = (data.byCategory || []).reduce((sum, c) => sum + c.count, 0);

  const statCards = [
    {
      icon: Users,
      label: 'Registered Users',
      te: 'నమోదైన వినియోగదారులు',
      value: data.totalUsers ?? 0,
      detail: 'View all users',
      bg: '#3b82f622',
      color: '#2563eb',
      action: onOpenUsers,
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
          const showActionHint = card.action === onOpenVerifications
            ? (data.pendingVerifications ?? 0) > 0
            : card.action === onOpenUsers
              ? (data.totalUsers ?? 0) > 0
              : false;
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
                {showActionHint && (
                  <p className="text-[10px] text-[#d97706] mt-2 flex items-center gap-1 font-semibold">
                    {card.action === onOpenUsers ? 'View users' : 'Review now'} <ChevronRight size={12} />
                  </p>
                )}
              </Wrapper>
            </motion.div>
          );
        })}
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
