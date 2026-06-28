import { Link } from "react-router-dom";
import { Sun, Moon, Clock, Star, ChevronRight } from "lucide-react";
import { usePanchangam } from "../../hooks/usePanchangam";
import { getPanchangamForDate } from "../../lib/panchangam";

const GOLD = "#E4B24B";

export default function PanchangamWidget() {
  const { data } = usePanchangam(new Date());
  const panchangam = data || getPanchangamForDate(new Date());

  return (
    <div className="mx-4 sm:mx-6 mt-6 corner-card overflow-hidden transition-shadow">
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div>
          <h3 className="font-telugu font-bold text-sm gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
            Today Panchangam
          </h3>
          <p className="text-xs text-muted">{panchangam.dateLabel} - {panchangam.day}</p>
        </div>
        <Link to="/panchangam" className="flex items-center gap-1 text-xs font-semibold" style={{ color: GOLD }}>
          More <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-0">
        <Cell icon={<Moon size={14} style={{ color: "#a78bfa" }} />} label="Tithi" value={panchangam.tithi} />
        <Cell icon={<Star size={14} style={{ color: GOLD }} />} label="Nakshatra" value={panchangam.nakshatra} borderLeft />
        <Cell icon={<Clock size={14} style={{ color: "#f87171" }} />} label="Rahukalam" value={panchangam.rahukalam} borderTop />
        <Cell icon={<Sun size={14} style={{ color: "#fb923c" }} />} label="Sunrise" value={panchangam.sunrise} borderTop borderLeft />
      </div>
      <div className="px-4 py-2.5 bg-elevated" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#4ade80", boxShadow: "0 0 6px rgba(74,222,128,0.5)" }} />
          <p className="text-xs font-medium" style={{ color: "#86efac" }}>{panchangam.auspicious}</p>
        </div>
      </div>
    </div>
  );
}

function Cell({ icon, label, value, borderTop, borderLeft }) {
  return (
    <div
      className="px-4 py-3 flex flex-col gap-0.5"
      style={{
        borderTop: borderTop ? "1px solid var(--border-subtle)" : undefined,
        borderLeft: borderLeft ? "1px solid var(--border-subtle)" : undefined,
      }}
    >
      <div className="flex items-center gap-1.5">{icon}<span className="text-xs text-muted">{label}</span></div>
      <span className="font-telugu text-sm font-semibold" style={{ color: GOLD, fontFamily: "Tiro Telugu, serif" }}>
        {value}
      </span>
    </div>
  );
}
