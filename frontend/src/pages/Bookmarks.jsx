import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, BookOpen, BookmarkX, Grid, List } from "lucide-react";
import { usePublicScriptures } from "../hooks/usePublicScriptures";
import { useBookmarks, useBookmarkActions } from "../hooks/useUserData";
import { ScriptureLoadingState, ScriptureErrorState } from "../components/ScriptureLoadingState";
import ScriptureCard from "../components/ScriptureCard";
import { toast } from "sonner";

const GOLD = "#E4B24B";

export default function Bookmarks() {
  const [view, setView] = useState("list");
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks();
  const { removeMutation } = useBookmarkActions();
  const { data: scriptures = [], isLoading: scripturesLoading, isError, refetch } = usePublicScriptures();

  const isLoading = bookmarksLoading || scripturesLoading;

  function remove(id) {
    removeMutation.mutate(id, {
      onSuccess: () => toast.success("Removed"),
      onError: () => toast.error("Could not remove bookmark"),
    });
  }

  const bookmarkedScriptures = bookmarks
    .map((b) => scriptures.find((s) => s.id === b.scripture_id))
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="min-h-screen page-bg">
        <ScriptureLoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen page-bg">
        <ScriptureErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-header px-4 sm:px-6 pt-5 sm:pt-8 pb-5 sm:pb-6">
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-telugu font-bold text-2xl sm:text-3xl mb-1 gold-glow"
              style={{ fontFamily: "Tiro Telugu, serif" }}>Bookmarks</h1>
            <p className="text-sm text-muted">{bookmarks.length} saved scriptures</p>
          </div>
          {bookmarks.length > 0 && (
            <div className="flex gap-1 rounded-xl p-1 bg-elevated" style={{ border: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setView("list")}
                className="p-2 rounded-lg transition-all"
                style={{ background: view === "list" ? '#C88F2D22' : 'transparent', color: GOLD }}>
                <List size={16} />
              </button>
              <button onClick={() => setView("grid")}
                className="p-2 rounded-lg transition-all"
                style={{ background: view === "grid" ? '#C88F2D22' : 'transparent', color: GOLD }}>
                <Grid size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-4xl mx-auto pb-28">
        {bookmarks.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="corner-card rounded-2xl p-12 text-center mt-4">
            <BookmarkX size={40} className="mx-auto mb-4 text-muted opacity-40" />
            <p className="font-bold text-base gold-glow mb-1" style={{ fontFamily: "Tiro Telugu, serif" }}>
              No bookmarks yet
            </p>
            <p className="text-sm text-muted mb-6">Save scriptures while reading to find them here</p>
            <Link to="/search" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold btn-gold">
              <BookOpen size={14} /> Browse Scriptures
            </Link>
          </motion.div>
        ) : view === "list" ? (
          <div className="space-y-2 mt-2">
            <AnimatePresence>
              {bookmarkedScriptures.map((s, i) => (
                <motion.div key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}>
                  <div className="corner-card rounded-2xl flex items-center gap-3 p-3">
                    <Link to={`/read/${s.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-elevated flex-shrink-0"
                        style={{ border: '1px solid var(--border-medium)' }}>
                        <span className="font-bold gold-glow text-sm" style={{ fontFamily: "Tiro Telugu, serif" }}>
                          {s.title_telugu.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
                          {s.title_telugu}
                        </p>
                        <p className="text-xs text-muted truncate">{s.title_english}</p>
                      </div>
                    </Link>
                    <button onClick={() => remove(s.id)} disabled={removeMutation.isPending}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {bookmarkedScriptures.map((s) => (
              <ScriptureCard key={s.id} scripture={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
