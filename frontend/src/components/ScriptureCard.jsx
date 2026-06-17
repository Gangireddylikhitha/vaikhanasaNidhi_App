import { Link } from "react-router-dom";
import { Bookmark, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryInfo } from "../data/scriptures";
import { isBookmarked, addBookmark, removeBookmark } from "../store/useAppStore";
import { useState } from "react";

const GOLD = "#E4B24B";

export default function ScriptureCard({ scripture, onBookmarkChange }) {
  const cat = getCategoryInfo(scripture.category);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(scripture.id));

  function toggleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) { removeBookmark(scripture.id); setBookmarked(false); }
    else { addBookmark(scripture); setBookmarked(true); }
    onBookmarkChange?.();
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="corner-card overflow-hidden h-full flex flex-col w-full"
    >
      <div className="flex items-start justify-between relative overflow-hidden p-3" style={{ borderBottom: '1px solid #C88F2D22' }}>
        <div className="flex-1 min-w-0 pr-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full font-medium leading-none"
            style={{ fontSize: 10, fontFamily: "Tiro Telugu, serif", color: '#C88F2D', border: '1px solid #C88F2D33', background: '#1a1a1a' }}
          >
            {cat.label}
          </span>
          {scripture.deity && (
            <p className="mt-1 truncate text-xs" style={{ fontFamily: "Tiro Telugu, serif", color: '#C88F2D66' }}>
              {scripture.deity}
            </p>
          )}
        </div>
        <button
          onClick={toggleBookmark}
          className="p-1 rounded-full flex-shrink-0 transition-all hover:bg-white/5"
          style={{ border: '1px solid #C88F2D33' }}
        >
          <Bookmark size={12} fill={bookmarked ? GOLD : "none"} color={GOLD} />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3
          className="font-bold leading-snug mb-1 line-clamp-2 gold-glow"
          style={{ fontFamily: "Tiro Telugu, serif", fontSize: 12 }}
        >
          {scripture.title_telugu}
        </h3>
        <p className="line-clamp-1 mb-2" style={{ fontSize: 10, color: '#C88F2D55' }}>
          {scripture.title_english}
        </p>
        <Link
          to={"/read/" + scripture.id}
          className="mt-auto flex items-center gap-1 font-semibold"
          style={{ color: GOLD, fontSize: 11, fontFamily: "Tiro Telugu, serif" }}
        >
          <BookOpen size={11} />
          Read
        </Link>
      </div>
    </motion.div>
  );
}
