import { ChevronRight, Lock } from 'lucide-react';
import { usePublicCategories } from '../../hooks/usePublicCategories';
import { isGuest } from '../../store/authStore';
import { useLoginPrompt } from '../../context/LoginPromptContext';
import GuestNavLink from '../GuestNavLink';

function CategoryGrid() {
  const { data: categories = [] } = usePublicCategories();
  const { requireLogin } = useLoginPrompt();
  const guest = isGuest();

  if (guest) {
    return (
      <section className="mt-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              All Categories
            </h2>
            <p className="text-scale-sm mt-1 text-muted">Login to explore sacred scriptures</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => requireLogin('/categories')}
          className="corner-card rounded-2xl w-full p-6 flex flex-col items-center text-center gap-3 hover:brightness-110 transition-all"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: '#C88F2D18', border: '1px solid #C88F2D33' }}
          >
            <Lock size={22} color="#E4B24B" />
          </div>
          <p className="font-telugu font-semibold text-scale-base gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            లాగిన్ చేసి వర్గాలను చూడండి
          </p>
          <p className="text-scale-sm text-muted">Sign in to browse stotras, mantras & more</p>
        </button>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3 mb-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h2 className="font-telugu font-bold text-scale-xl gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
            All Categories
          </h2>
          <p className="text-scale-sm mt-1 text-muted">Sacred pathways to eternal knowledge</p>
        </div>
        <GuestNavLink to="/categories" className="view-all-btn flex-shrink-0">
          View All <ChevronRight size={13} />
        </GuestNavLink>
      </div>

      <div className="scroll-row-wrap px-4 sm:px-6 lg:px-8">
        <div className="scroll-row py-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            if (!cat.img || !Icon) return null;
            return (
              <GuestNavLink
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
                  style={{ fontFamily: 'Tiro Telugu, serif' }}
                >
                  {cat.label}
                </p>
              </GuestNavLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
