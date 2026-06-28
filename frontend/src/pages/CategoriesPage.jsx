import { motion } from "framer-motion"; // Imported back for future animations if needed
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { MAIN_CATEGORIES } from "../data/categories";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen page-bg pb-24">
      <div className="page-header px-4 sm:px-6 pt-5 pb-5">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted mb-3 hover:opacity-80">
          <ChevronLeft size={14} /> Back
        </Link>
        <h1 className="font-telugu font-bold text-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
          All Categories
        </h1>
        <p className="text-sm text-muted mt-1">Sacred pathways to eternal knowledge</p>
      </div>

      {/* Added max-w-5xl and mx-auto to maintain a neat card dimension on desktop screens */}
      <div className="px-4 sm:px-6 py-3 w-full max-w-5xl mx-auto">
        {/* Changed grid-cols-2 to grid-cols-4 so exactly 4 cards fit on one line */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
          {MAIN_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={`/categories/${cat.key}`}
                className="main-category-card block w-full"
              >
                {/* Ensure aspect ratio handles smaller container bounds elegantly */}
                <div className="main-category-card-media relative overflow-hidden aspect-square rounded-xl" style={{ border: "1px solid var(--border-subtle)" }}>
                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" loading="lazy" />
                  <div className="main-category-card-icon absolute top-2 right-2">
                    <Icon size={14} className="text-primary-gold" />
                  </div>
                </div>
                <p
                  className="main-category-card-label font-telugu font-bold text-xs gold-glow text-center mt-2"
                  style={{ fontFamily: "Tiro Telugu, serif" }}
                >
                  {cat.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}