import { motion } from 'framer-motion';
import { ChevronRight, Moon, Star, Clock, Sunrise } from 'lucide-react';
import { usePanchangam } from '../../hooks/usePanchangam';
import GuestNavLink from '../GuestNavLink';
import {
  formatWidgetSunrise,
  formatWidgetTimeRange,
  formatWidgetBrahmaMuhurtam,
} from '../../lib/panchangamSource';

function GridItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={14} className="flex-shrink-0 panchang-widget-label" strokeWidth={2} />
        <span className="panchang-widget-label">{label}</span>
      </div>
      <p
        className="panchang-widget-value font-telugu leading-tight"
        style={{ fontFamily: 'Tiro Telugu, serif' }}
      >
        {value || '—'}
      </p>
    </div>
  );
}

function PanchangamWidgetSkeleton({ embedded = false }) {
  const wrapClass = embedded ? 'mt-0 px-0' : 'mt-8 px-4 sm:px-6 lg:px-8';
  return (
    <section className={wrapClass}>
      <div className="panchang-widget animate-pulse">
        <div className="panchang-widget-header h-16 opacity-70" />
        <div className="panchang-widget-body p-4 grid grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 rounded bg-elevated" />
              <div className="h-4 w-24 rounded bg-elevated" />
            </div>
          ))}
        </div>
        <div className="panchang-widget-footer h-10" />
      </div>
    </section>
  );
}

export default function PanchangamWidget({ embedded = false }) {
  const { data, isLoading } = usePanchangam(new Date());
  const n = data?.nithra;

  if (isLoading && !data) return <PanchangamWidgetSkeleton embedded={embedded} />;
  if (!data) return null;

  const wrapClass = embedded ? 'mt-0 px-0' : 'mt-8 px-4 sm:px-6 lg:px-8';

  const dateLine = `${data.dateLabel} - ${data.vaaram || data.day}`;
  const sunriseRaw = n?.sunrise || data.sunrise;
  const rahuRaw = n?.rahukalam || data.rahukalam || data.muhurtham?.rahuKalam;
  const brahma = formatWidgetBrahmaMuhurtam(sunriseRaw);

  const cells = [
    { icon: Moon, label: 'Tithi', value: data.tithi },
    { icon: Star, label: 'Nakshatra', value: data.nakshatra },
    { icon: Clock, label: 'Rahukalam', value: formatWidgetTimeRange(rahuRaw) },
    { icon: Sunrise, label: 'Sunrise', value: formatWidgetSunrise(sunriseRaw) },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${wrapClass} ${embedded ? 'h-full' : ''}`}
    >
      <GuestNavLink to="/panchangam" className="block panchang-widget group w-full text-left">
        <div className="panchang-widget-header px-4 py-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              className="font-bold text-base leading-tight"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1a1208' }}
            >
              Today Panchangam
            </h2>
            <p
              className="font-telugu text-sm mt-1 opacity-90 leading-snug"
              style={{ fontFamily: 'Tiro Telugu, serif', color: '#1a1208' }}
            >
              {dateLine}
            </p>
          </div>
          <span className="panchang-widget-more flex items-center gap-0.5 pt-0.5 group-hover:opacity-100">
            More <ChevronRight size={14} />
          </span>
        </div>

        <div className="panchang-widget-body px-4 py-4 grid grid-cols-2 gap-x-5 gap-y-5">
          {cells.map((cell) => (
            <GridItem key={cell.label} {...cell} />
          ))}
        </div>

        {brahma && (
          <div className="panchang-widget-footer px-4 py-2.5 font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            • బ్రహ్మ ముహూర్తం: {brahma}
          </div>
        )}
      </GuestNavLink>
    </motion.section>
  );
}
