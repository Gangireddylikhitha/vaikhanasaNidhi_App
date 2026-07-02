import { useMemo, useState } from 'react';
import {
  Shield, Clock, CheckCircle2, ShieldAlert, Search, MapPin,
  Phone, User, Check, X, Loader2, Bookmark, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminVerifications, useReviewVerification } from '../../hooks/useVerification';
import AdminPageState from '../../components/admin/AdminPageState';
import { getApiError } from '../../lib/apiError';

const TABS = [
  { id: 'pending', label: 'పెండింగ్', labelFull: 'పరిశీలించవలసినవి', icon: Clock },
  { id: 'approved', label: 'ఆమోదం', labelFull: 'ఆమోదించబడినవి', icon: CheckCircle2 },
  { id: 'rejected', label: 'తిరస్కారం', labelFull: 'తిరస్కరించబడినవి', icon: ShieldAlert },
];

const STATUS_META = {
  pending: { label: 'Pending', className: 'admin-vdash-status--pending' },
  approved: { label: 'Approved', className: 'admin-vdash-status--approved' },
  rejected: { label: 'Rejected', className: 'admin-vdash-status--rejected' },
};

function EmptyList({ filter }) {
  return (
    <div className="admin-vdash-empty">
      <Shield size={44} strokeWidth={1} className="admin-vdash-empty-icon" />
      <p className="font-telugu text-sm font-semibold text-muted" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        ఫైళ్లు లేవు
      </p>
      <p className="text-xs text-muted mt-1 text-center px-4">
        {filter === 'pending'
          ? 'ఈ విభాగంలో ఎటువంటి దరఖాస్తులు లేవు.'
          : filter === 'approved'
            ? 'ఇంకా ఆమోదించబడిన దరఖాస్తులు లేవు.'
            : 'తిరస్కరించబడిన దరఖాస్తులు లేవు.'}
      </p>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="admin-vdash-empty">
      <Shield size={44} strokeWidth={1} className="admin-vdash-empty-icon" />
      <p className="font-telugu text-sm font-semibold text-muted" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        దరఖాస్తును ఎంచుకోండి
      </p>
      <p className="text-xs text-muted mt-1">Select an application to view details</p>
    </div>
  );
}

function ActionButtons({ status, onApprove, onReject, busy }) {
  return (
    <div className="admin-vdash-action-row">
      <button
        type="button"
        onClick={onApprove}
        disabled={busy}
        className={`admin-vdash-action-btn admin-vdash-action-btn--approve ${status === 'approved' ? 'is-current' : ''}`}
        title="Approve"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
        <span>ఆమోదం</span>
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={busy}
        className={`admin-vdash-action-btn admin-vdash-action-btn--reject ${status === 'rejected' ? 'is-current' : ''}`}
        title="Reject"
      >
        <X size={13} />
        <span>తిరస్కారం</span>
      </button>
    </div>
  );
}

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAdminVerifications(filter);
  const reviewMutation = useReviewVerification({
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'approved' ? 'ఆమోదించబడింది' : 'తిరస్కరించబడింది');
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification'] });
      refetch();
    },
    onError: (err) => toast.error(getApiError(err, 'Update failed')),
  });

  const applications = data?.applications || [];
  const counts = {
    pending: data?.pending ?? 0,
    approved: data?.approved ?? 0,
    rejected: data?.rejected ?? 0,
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) =>
      [app.full_name, app.gothram, app.username, app.native_place, app.kalpasutram]
        .some((v) => v?.toLowerCase().includes(q))
    );
  }, [applications, search]);

  const selected = applications.find((a) => a.id === selectedId) || null;

  function selectApp(id) {
    setSelectedId(id);
    setMobileShowDetail(true);
  }

  function review(status) {
    if (!selected) return;
    reviewMutation.mutate({ id: selected.id, status });
  }

  function changeFilter(id) {
    setFilter(id);
    setSelectedId(null);
    setMobileShowDetail(false);
    setSearch('');
  }

  const showList = !mobileShowDetail;

  return (
    <AdminPageState
      isLoading={isLoading}
      isError={isError}
      error={getApiError(error, 'Failed to load applications.')}
      onRetry={refetch}
    >
      <div className="admin-vdash-shell">
        <div className="admin-vdash-header">
          <div className="flex items-center gap-3 min-w-0">
            <div className="admin-vdash-header-icon">
              <Shield size={20} className="text-primary-gold" />
            </div>
            <div className="min-w-0">
              <h1 className="font-telugu text-lg sm:text-xl font-bold gold-glow truncate"
                style={{ fontFamily: 'Tiro Telugu, serif' }}>
                ధృవీకరణ డ్యాష్‌బోర్డ్
              </h1>
              <p className="font-telugu text-xs text-muted truncate" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                అర్హులు మాత్రమే యాక్సెస్
              </p>
            </div>
          </div>
        </div>

        <div className="admin-vdash-toolbar">
          <div className="admin-vdash-search admin-vdash-search--full">
            <Search size={15} className="text-muted flex-shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="పేరు, గోత్రం, స్థలం..."
              className="admin-vdash-search-input font-telugu"
              style={{ fontFamily: 'Tiro Telugu, serif' }}
            />
          </div>
          <div className="admin-vdash-tabs">
            {TABS.map(({ id, label, labelFull, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => changeFilter(id)}
                className={`admin-vdash-tab ${filter === id ? 'admin-vdash-tab--active' : ''}`}
                title={labelFull}
              >
                <Icon size={13} />
                <span className="font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>{label}</span>
                <span className="admin-vdash-tab-count">{counts[id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-vdash-body">
          {/* List — hidden on mobile when detail open */}
          <div className={`admin-vdash-list ${mobileShowDetail ? 'admin-vdash-list--hidden-mobile' : ''}`}>
            {filtered.length === 0 ? (
              <EmptyList filter={filter} />
            ) : (
              filtered.map((app) => {
                const meta = STATUS_META[app.status] || STATUS_META.pending;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => selectApp(app.id)}
                    className={`admin-vdash-list-item ${selectedId === app.id ? 'admin-vdash-list-item--active' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 w-full">
                      <div className="admin-vdash-list-avatar">
                        <Bookmark size={13} className="text-primary-gold" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-telugu font-semibold text-sm text-body truncate flex-1"
                            style={{ fontFamily: 'Tiro Telugu, serif' }}>
                            {app.full_name}
                          </p>
                          <span className={`admin-vdash-status ${meta.className}`}>{meta.label}</span>
                        </div>
                        <p className="text-[11px] text-muted truncate">{app.native_place}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail */}
          <div className={`admin-vdash-detail ${showList ? '' : 'admin-vdash-detail--full-mobile'}`}>
            {mobileShowDetail && (
              <button
                type="button"
                className="admin-vdash-back lg:hidden"
                onClick={() => setMobileShowDetail(false)}
              >
                <ChevronLeft size={16} />
                <span className="font-telugu text-sm" style={{ fontFamily: 'Tiro Telugu, serif' }}>వెనుకకు</span>
              </button>
            )}

            {!selected ? (
              <EmptyDetail />
            ) : (
              <div className="admin-vdash-detail-inner">
                <div className="admin-vdash-profile">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-telugu font-bold text-body text-base"
                          style={{ fontFamily: 'Tiro Telugu, serif' }}>
                          {selected.full_name}
                        </p>
                        <span className={`admin-vdash-status ${STATUS_META[selected.status]?.className}`}>
                          {STATUS_META[selected.status]?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 truncate">{selected.kalpasutram}</p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <User size={11} /> @{selected.username}
                      </p>
                    </div>
                    <a
                      href={`tel:+91${selected.whatsapp?.replace(/\D/g, '').slice(-10)}`}
                      className="admin-vdash-phone-chip"
                    >
                      <Phone size={12} />
                      {selected.whatsapp}
                    </a>
                  </div>

                  <p className="text-xs text-muted flex items-center gap-1 mt-2">
                    <MapPin size={11} className="text-primary-gold" />
                    {selected.native_place}
                  </p>

                  <ActionButtons
                    status={selected.status}
                    onApprove={() => review('approved')}
                    onReject={() => review('rejected')}
                    busy={reviewMutation.isPending}
                  />
                </div>

                <div className="admin-vdash-fields">
                  {[
                    { te: 'గోత్రము', en: 'Gothram', value: selected.gothram },
                    { te: 'వేద శాఖ', en: 'Veda Shakha', value: selected.veda_shakha || '—' },
                    { te: 'దేవాలయం / రెఫరెన్స్', en: 'Temple Reference', value: selected.temple_reference || '—' },
                  ].map(({ te, en, value }) => (
                    <div key={te} className="admin-vdash-field">
                      <p className="admin-vdash-field-label">
                        <span className="font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>{te}</span>
                        <span className="text-muted"> / {en}</span>
                      </p>
                      <p className="font-telugu text-sm text-body mt-0.5" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                        {value}
                      </p>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted mt-3">
                    సమర్పించిన తేదీ: {new Date(selected.submitted_at).toLocaleString('te-IN')}
                    {selected.reviewed_at && (
                      <> · సమీక్షించిన తేదీ: {new Date(selected.reviewed_at).toLocaleString('te-IN')}</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPageState>
  );
}
