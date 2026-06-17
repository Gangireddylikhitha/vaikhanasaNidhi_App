import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import HeroCard from "../components/home/HeroCard";
import CategoryGrid from "../components/home/CategoryGrid";
import PanchangamWidget from "../components/home/PanchangamWidget";
import ScriptureCard from "../components/ScriptureCard";
import { SCRIPTURES, getCategoryInfo } from "../data/scriptures";
import { getReadingProgress } from "../store/useAppStore";
import { DAILY_SLOKAS } from "../data/scriptures";

const GOLD = "#E4B24B";

export default function Home() {
  const [, forceUpdate] = useState(0);
  const progress = getReadingProgress();
  const popular = [...SCRIPTURES].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
  const quoteSloka = DAILY_SLOKAS[0];

  return (
    <div className="pb-10">
      <div className="xl:flex xl:gap-0">

        <div className="xl:flex-1 min-w-0">
          <HeroCard />
          <CategoryGrid />

          {progress.length > 0 && (
            <section className="mt-8 px-4 sm:px-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-telugu font-bold text-base sm:text-lg gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                  Continue Reading
                </h2>
                <Link to="/profile" className="flex items-center gap-1 text-xs" style={{ color: '#C88F2D' }}>
                  All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide">
                {progress.slice(0, 8).map(item => {
                  const cat = getCategoryInfo(item.category);
                  return (
                    <Link
                      key={item.scripture_id}
                      to={"/read/" + item.scripture_id}
                      className="flex-shrink-0 w-44 sm:w-52 corner-card overflow-hidden hover:brightness-110 transition-all"
                    >
                      <div className="p-3" style={{ borderBottom: '1px solid #C88F2D22', background: '#1a1a1a' }}>
                        <span className="font-telugu text-xs" style={{ fontFamily: "Tiro Telugu, serif", color: GOLD }}>{cat.label}</span>
                      </div>
                      <div className="p-3">
                        <p className="font-telugu text-sm font-semibold leading-snug mb-2 line-clamp-2 gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                          {item.title_telugu}
                        </p>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #C88F2D, #E4B24B)', width: item.progress + "%" }}
                            initial={{ width: 0 }}
                            animate={{ width: item.progress + "%" }}
                          />
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#C88F2D55' }}>{item.progress}%</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <div className="xl:hidden"><PanchangamWidget /></div>

          <section className="px-4 sm:px-6 mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: GOLD }} />
                <h2 className="font-telugu font-bold text-base sm:text-lg gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                  Popular Scriptures
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {popular.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <ScriptureCard scripture={s} onBookmarkChange={() => forceUpdate(n => n + 1)} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quote section — reference bottom */}
          <section className="px-4 sm:px-6 mt-12 mb-4">
            <div className="flex flex-col items-center text-center py-10">
              <Sparkles size={20} style={{ color: '#C88F2D', marginBottom: 12, filter: 'drop-shadow(0 0 8px rgba(200,143,45,0.5))' }} />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: '#C88F2D66' }}>
                From the Vaikhanasa Agama
              </p>
              <p
                className="font-telugu font-bold leading-relaxed max-w-2xl gold-glow-strong"
                style={{ fontFamily: "Tiro Telugu, serif", fontSize: 'clamp(1rem, 3vw, 1.4rem)' }}
              >
                {quoteSloka.telugu}
              </p>
            </div>
          </section>

          <section className="px-4 sm:px-6 mt-6">
            <div className="corner-card p-4 sm:p-5 grid grid-cols-3 gap-2">
              {[
                { label: "Scriptures", value: SCRIPTURES.length },
                { label: "Categories", value: 8 },
                { label: "Verses", value: SCRIPTURES.reduce((a, s) => a + s.verses.length, 0) },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center gap-1 py-2">
                  <span className="font-bold text-2xl sm:text-3xl gold-glow">{stat.value}</span>
                  <span className="text-xs text-center" style={{ color: '#C88F2D66' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="hidden xl:block w-80 flex-shrink-0 px-4 pt-4">
          <div className="sticky top-20 space-y-4">
            <PanchangamWidget />
            <div className="corner-card p-4">
              <h3 className="font-telugu font-bold text-sm mb-3 gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>Quick Links</h3>
              <div className="space-y-1">
                {[
                  { to: "/panchangam", label: "Today Panchangam" },
                  { to: "/search", label: "Mantras" },
                  { to: "/search", label: "Stotras" },
                  { to: "/bookmarks", label: "My Bookmarks" },
                ].map(l => (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <span className="font-telugu text-sm" style={{ fontFamily: "Tiro Telugu, serif", color: '#C88F2Dcc' }}>{l.label}</span>
                    <ChevronRight size={14} style={{ color: '#C88F2D55' }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
