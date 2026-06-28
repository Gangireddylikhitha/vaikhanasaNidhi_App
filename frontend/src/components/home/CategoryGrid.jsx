import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MAIN_CATEGORIES } from "../../data/categories";

function CategoryGrid() {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3 mb-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: "Tiro Telugu, serif" }}>
            All Categories
          </h2>
          <p className="text-scale-sm mt-1 text-muted">Sacred pathways to eternal knowledge</p>
        </div>
        <Link to="/categories" className="view-all-btn flex-shrink-0">
          View All <ChevronRight size={13} />
        </Link>
      </div>

      <div className="scroll-row-wrap px-4 sm:px-6 lg:px-8">
        <div className="scroll-row py-2">
          {MAIN_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={`/categories/${cat.key}`}
                className="category-scroll-tile"
              >
                <div className="category-scroll-tile-media">
                  <img src={cat.img} alt={cat.label} loading="lazy" />
                  <div className="category-scroll-tile-icon">
                    <Icon size={13} className="text-primary-gold" />
                  </div>
                </div>
                <p
                  className="category-scroll-tile-label font-telugu font-semibold text-scale-xs"
                  style={{ fontFamily: "Tiro Telugu, serif" }}
                >
                  {cat.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
