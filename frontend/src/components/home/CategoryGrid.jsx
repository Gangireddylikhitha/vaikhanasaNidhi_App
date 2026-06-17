import { motion } from "framer-motion";
import { Music, Zap, Hash, List, BookMarked, FlameKindling, CalendarDays, Library, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import imgStotras from "../../assets/catagoryImages/stotras.png";
import imgMantras from "../../assets/catagoryImages/mantralu.png";
import imgAshtottaram from "../../assets/catagoryImages/astothranamalu.png";
import imgSahasranamam from "../../assets/catagoryImages/sahastranamalu.png";
import imgAgama from "../../assets/catagoryImages/agama.png";
import imgPooja from "../../assets/catagoryImages/puja_vidhanam.png";
import imgPanchangam from "../../assets/catagoryImages/Panchangam.png";
import imgBooks from "../../assets/catagoryImages/grandalu.png";

export const CATEGORIES = [
  { key: "stotra",         label: "స్తోత్రాలు",       en: "Stotras",       icon: Music,          count: "12 Stotras",   img: imgStotras      },
  { key: "mantra",         label: "మంత్రాలు",          en: "Mantras",        icon: Zap,            count: "12 Mantras",   img: imgMantras      },
  { key: "ashtottaram",    label: "అష్టోత్తరalu",      en: "Ashtottarams",   icon: Hash,           count: "8 Names",      img: imgAshtottaram  },
  { key: "sahasranamam",   label: "సహస్రనామalu",      en: "Sahasranama",    icon: List,           count: "1000 Names",   img: imgSahasranamam },
  { key: "agama",          label: "ఆగమalu",            en: "Agamas",         icon: BookMarked,     count: "5 Procedures", img: imgAgama        },
  { key: "pooja_vidhanam", label: "పూజా విధానalu",    en: "Pooja",          icon: FlameKindling,  count: "8 Rituals",    img: imgPooja        },
  { key: "panchangam",     label: "పంచాంగం",          en: "Panchangam",     icon: CalendarDays,   count: "Daily",        img: imgPanchangam,  link: "/panchangam" },
  { key: "book",           label: "గ్రంధalu",         en: "Books",          icon: Library,        count: "20 Books",     img: imgBooks        },
];

const FEATURED = CATEGORIES.slice(0, 3);

function CategoryGrid() {
  return (
    <section className="px-4 sm:px-6 mt-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-telugu font-bold text-lg sm:text-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
            Sacred Pathways
          </h2>
          <p className="text-xs mt-1" style={{ color: '#C88F2D66' }}>Sacred pathways to eternal knowledge</p>
        </div>
        <Link to="/search" className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase" style={{ color: '#C88F2D' }}>
          View All <ChevronRight size={12} />
        </Link>
      </div>

      {/* Featured 3 cards — reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {FEATURED.map((cat, i) => {
          const Icon = cat.icon;
          const href = cat.link || "/search?cat=" + cat.key;
          return (
            <motion.a
              key={cat.key}
              href={href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="corner-card block p-6 group cursor-pointer"
            >
              <div className="flex flex-col items-center text-center gap-4 py-2">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ border: '1px solid #C88F2D44', background: '#1a1a1a' }}
                >
                  <Icon size={24} style={{ color: '#E4B24B', filter: 'drop-shadow(0 0 6px rgba(228,178,75,0.5))' }} />
                </div>
                <div>
                  <p className="font-telugu font-bold text-base gold-glow mb-1" style={{ fontFamily: "Tiro Telugu, serif" }}>
                    {cat.en}
                  </p>
                  <p className="text-xs" style={{ color: '#C88F2D77' }}>{cat.label}</p>
                </div>
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#C88F2D55' }}>
                  {cat.count}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* All categories grid */}
      <h3 className="font-telugu font-bold text-sm mb-3" style={{ color: '#C88F2D99', fontFamily: "Tiro Telugu, serif" }}>
        All Categories
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const href = cat.link || "/search?cat=" + cat.key;
          return (
            <motion.a
              key={cat.key}
              href={href}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.07, y: -3 }}
              whileTap={{ scale: 0.93 }}
              className="relative rounded-xl overflow-hidden cursor-pointer select-none"
              style={{ aspectRatio: "1 / 1.2", border: '1px solid #C88F2D22' }}
            >
              <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover opacity-60" loading="lazy" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)" }} />
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-2 sm:p-2.5">
                <div className="self-end">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center" style={{ background: '#C88F2D22', border: '1px solid #C88F2D33' }}>
                    <Icon size={13} color="#E4B24B" />
                  </div>
                </div>
                <span className="w-full text-center font-semibold leading-tight" style={{ fontFamily: "Tiro Telugu, serif", fontSize: "10px", color: '#E4B24B' }}>
                  {cat.en}
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryGrid;
