import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, BookOpen, Info, Phone } from "lucide-react";
import HeroCard from "../components/home/HeroCard";
import CategoryGrid from "../components/home/CategoryGrid";
import PanchangamWidget from "../components/home/PanchangamWidget";
import ScriptureCard from "../components/ScriptureCard";
import { ScriptureLoadingState, ScriptureErrorState } from "../components/ScriptureLoadingState";
import { usePublicCategories } from "../hooks/usePublicCategories";
import { usePublicScriptures, useRecentScriptures } from "../hooks/usePublicScriptures";
import { useReadingProgress } from "../hooks/useUserData";
import { usePublicStats } from "../hooks/usePublicStats";
import { useDailySloka } from "../hooks/useDailySloka";
import { msUntilMidnight } from "../lib/dailySloka";
import { isImageProgressItem } from "../utils/scriptureSubcategoryMatch";

import { isLoggedIn, isGuest } from "../store/authStore";
import GuestNavLink from "../components/GuestNavLink";

const GOLD = "#E4B24B";

export default function Home() {
  const [, forceUpdate] = useState(0);
  const guest = isGuest();
  const { data: dailySloka, refetch: refetchSloka } = useDailySloka();
  const { data: publicStats } = usePublicStats();
  const { data: mainCategories = [] } = usePublicCategories();
  const { data: allScriptures = [], isLoading, isError, refetch } = usePublicScriptures();
  const { data: recentScriptures = [] } = useRecentScriptures(8);
  const { data: progress = [] } = useReadingProgress({ enabled: isLoggedIn() });
  const scriptureById = useMemo(
    () => new Map(allScriptures.map((s) => [s.id, s])),
    [allScriptures]
  );
  const continueReading = progress
    .filter((p) => p.progress > 0 && p.progress < 95 && !isImageProgressItem(p, scriptureById))
    .slice(0, 3);

  useEffect(() => {
    const timer = setTimeout(() => refetchSloka(), msUntilMidnight());
    return () => clearTimeout(timer);
  }, [dailySloka, refetchSloka]);

  const quoteSloka = dailySloka || { telugu: '' };
  const stats = publicStats || {
    totalScriptures: allScriptures.length,
    totalCategories: mainCategories.length,
    totalVerses: allScriptures.reduce((a, s) => a + (s.verses?.length || 0), 0),
  };

  return (
    <div className="pb-10">
      <HeroCard />
      <CategoryGrid />

      <section className="home-widgets px-4 sm:px-6 lg:px-8 mt-8">
        <div className="home-widgets-grid">
          <PanchangamWidget embedded />
          {!guest && (
            <div className="gold-card home-widget-card p-4 h-fit">
              <h3 className="font-telugu font-bold text-scale-base mb-3 gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                Quick Links
              </h3>
              <div className="space-y-1">
                {[
                  { to: "/panchangam", label: "Today Panchangam" },
                  { to: "/search", label: "Mantras" },
                  { to: "/categories", label: "All Categories" },
                  { to: "/bookmarks", label: "My Bookmarks" },
                  { to: "/about", label: "About Us" },
                  { to: "/contact", label: "Contact Us" },
                ].map((l) => (
                  <GuestNavLink
                    key={l.label}
                    to={l.to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--hover-bg)]"
                  >
                    <span className="font-telugu text-scale-sm text-secondary" style={{ fontFamily: "Tiro Telugu, serif" }}>
                      {l.label}
                    </span>
                    <ChevronRight size={14} className="text-muted" />
                  </GuestNavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {!guest && continueReading.length > 0 && (
        <section className="mt-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
              Continue Reading
            </h2>
            <Link to="/profile" className="view-all-btn flex-shrink-0">
              See all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {continueReading.map((item, i) => (
              <motion.div key={item.scripture_id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Link to={"/read/" + item.scripture_id}
                  className="corner-card rounded-2xl p-4 flex items-center gap-3 block hover:brightness-110 transition-all">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-elevated"
                    style={{ border: "1px solid var(--border-medium)" }}>
                    <BookOpen size={16} color={GOLD} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate gold-glow"
                      style={{ fontFamily: "Tiro Telugu, serif" }}>
                      {item.title_telugu}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-elevated">
                        <div className="h-full rounded-full"
                          style={{ width: `${item.progress}%`, background: "linear-gradient(90deg, #C88F2D, #E4B24B)" }} />
                      </div>
                      <span className="text-xs tabular-nums flex-shrink-0" style={{ color: "#C88F2D88" }}>
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!guest && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3 mb-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                Recent Addon Scriptures
              </h2>
            </div>
            <GuestNavLink to="/search" className="view-all-btn flex-shrink-0">
              View All <ChevronRight size={13} />
            </GuestNavLink>
          </div>
          <div className="scroll-row-wrap px-4 sm:px-6 lg:px-8">
            <div className="scroll-row py-2">
              {isLoading && <ScriptureLoadingState message="Loading recent scriptures…" />}
              {isError && <ScriptureErrorState onRetry={refetch} />}
              {!isLoading && !isError && recentScriptures.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-56 sm:w-60 md:w-64 lg:w-[17rem] scroll-pop-card"
                >
                  <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 sm:px-6 lg:px-8 mt-12 mb-4">
        <div className="flex flex-col items-center text-center py-10">
          <Sparkles size={20} className="text-primary-gold mb-3" style={{ filter: "drop-shadow(0 0 8px rgba(200,143,45,0.5))" }} />
          <p className="text-scale-sm font-semibold tracking-[0.25em] uppercase mb-6 text-muted">
            నేటి విష్ణు సహస్రనామ శ్లోకం
          </p>
          <p className="font-telugu font-bold leading-relaxed max-w-2xl gold-glow-strong text-scale-xl" style={{ fontFamily: "Tiro Telugu, serif" }}>
            {quoteSloka.telugu}
          </p>
        </div>
      </section>

      {!guest && (
        <section className="px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-2 gap-3 max-w-2xl">
            <GuestNavLink to="/about"
              className="corner-card rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:brightness-110 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#C88F2D18', border: '1px solid #C88F2D33' }}>
                <Info size={18} color={GOLD} />
              </div>
              <p className="font-telugu font-bold text-sm gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                గురించి
              </p>
              <p className="text-xs text-muted">About Us</p>
            </GuestNavLink>
            <GuestNavLink to="/contact"
              className="corner-card rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:brightness-110 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#C88F2D18', border: '1px solid #C88F2D33' }}>
                <Phone size={18} color={GOLD} />
              </div>
              <p className="font-telugu font-bold text-sm gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                సంప్రదింపు
              </p>
              <p className="text-xs text-muted">Contact Us</p>
            </GuestNavLink>
          </div>
        </section>
      )}

      {!guest && (
        <section className="px-4 sm:px-6 lg:px-8 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="gold-card p-4 sm:p-5 grid grid-cols-3 gap-2"
          >
            {[
              { label: "Scriptures", value: stats.totalScriptures ?? 0 },
              { label: "Categories", value: stats.totalCategories ?? mainCategories.length },
              { label: "Verses", value: stats.totalVerses ?? 0 },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 260 }}
                className="stat-cell flex flex-col items-center gap-1 py-2 px-1"
              >
                <span className="font-bold text-scale-3xl gold-glow">{stat.value}</span>
                <span className="text-scale-sm text-center text-muted">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}
