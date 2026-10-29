import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Images } from 'lucide-react';
import { useGalleryEvents, useGalleryPhotos, useGallerySubcategories } from '../hooks/useGallery';
import CompactImageLightbox from '../components/CompactImageLightbox';
import { brandLogo } from '../constants/brandAssets';

const GOLD = 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)';
const GOLD_DARK = '#8B6200';
const GOLD_SOLID = '#C88F2D';

export default function Gallery() {
  const { data: albums = [], isLoading, isError, refetch } = useGalleryEvents();
  const { data: photos = [] } = useGalleryPhotos();
  const { data: subcategories = [] } = useGallerySubcategories();
  const [activeSub, setActiveSub] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const albumGroups = useMemo(() => albums
    .map((album) => ({
      ...album,
      photos: photos.filter((p) => p.eventId === album.id),
    }))
    .filter((album) => album.photos.length > 0), [albums, photos]);

  const filteredGroups = activeSub === 'all'
    ? albumGroups
    : albumGroups.filter((album) => album.subcategoryKey === activeSub);

  return (
    <div className="min-h-screen page-bg">

      <div className="px-4 pt-8 pb-6" style={{ background: GOLD }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/25">
              <Images size={20} color={GOLD_DARK} />
            </div>
            <div>
              <h1 className="font-bold text-2xl leading-tight" style={{ color: GOLD_DARK, fontFamily: 'Tiro Telugu, serif' }}>
                చిత్రాలు
              </h1>
              <p className="text-xs" style={{ color: GOLD_DARK + '99' }}>Photo Gallery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
            <img src={brandLogo} alt="" className="brand-loader" width={48} height={48} />
            <span className="text-sm">Loading gallery…</span>
          </div>
        )}

        {isError && (
          <div className="corner-card rounded-2xl py-12 text-center">
            <p className="text-sm text-muted mb-3">Could not load gallery</p>
            <button onClick={() => refetch()} className="text-sm font-semibold" style={{ color: GOLD_SOLID }}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setActiveSub('all')}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: activeSub === 'all' ? GOLD : 'var(--bg-card)',
                color: activeSub === 'all' ? GOLD_DARK : 'var(--text-muted)',
                border: activeSub === 'all' ? 'none' : '1px solid var(--border-medium)',
                boxShadow: activeSub === 'all' ? '0 2px 8px #C88F2D33' : 'none',
              }}>
              అన్నీ · All ({photos.length})
            </button>
            {subcategories.map((sub) => {
              const active = activeSub === sub.id;
              return (
                <button key={sub.id} onClick={() => setActiveSub(sub.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: active ? GOLD : 'var(--bg-card)',
                    color: active ? GOLD_DARK : 'var(--text-muted)',
                    border: active ? 'none' : '1px solid var(--border-medium)',
                    boxShadow: active ? '0 2px 8px #C88F2D33' : 'none',
                  }}>
                  <span style={{ fontFamily: 'Tiro Telugu, serif' }}>{sub.label}</span>
                  <span className="ml-1.5 opacity-70">{sub.label_en} ({sub.count})</span>
                </button>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && photos.length === 0 && (
          <div className="corner-card rounded-2xl py-20 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#F6D67A33' }}>
              <Images size={28} color={GOLD_SOLID} strokeWidth={1.5} />
            </div>
            <p className="font-bold text-base gold-glow" style={{ fontFamily: 'Tiro Telugu, serif' }}>
              ఇంకా చిత్రాలు లేవు
            </p>
            <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
              Upload albums in Admin → Gallery
            </p>
          </div>
        )}

        <div className="space-y-8 pb-10">
          {filteredGroups.map((album) => (
            <div key={album.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ background: '#E4B24B44' }} />
                <div className="px-4 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: '#F6D67A55', color: GOLD_DARK }}>
                  <span style={{ fontFamily: 'Tiro Telugu, serif' }}>{album.label}</span>
                  {album.label_en && album.label_en !== album.label && (
                    <span className="ml-1.5 opacity-70">· {album.label_en}</span>
                  )}
                  {album.subLabel && (
                    <span className="ml-1.5 opacity-60 text-[10px]">({album.subLabel})</span>
                  )}
                </div>
                <div className="h-px flex-1" style={{ background: '#E4B24B44' }} />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {album.photos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="rounded-xl overflow-hidden cursor-pointer group shadow-sm bg-card relative text-left"
                    style={{ border: '1px solid var(--border-subtle)' }}
                    onClick={() => setLightbox({ photos: album.photos, index: idx })}
                  >
                    <div className="relative overflow-hidden bg-elevated">
                      <img src={photo.url} alt={photo.caption}
                        className="w-full h-[20vh] max-h-28 sm:max-h-32 object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all" />
                    </div>
                    {photo.caption && (
                      <p className="px-2 py-1.5 text-[10px] text-muted truncate">{photo.caption}</p>
                    )}
                  </button>
                ))}
              </div>

              {album.description && (
                <p className="text-xs text-muted mt-3 px-1" style={{ fontFamily: 'Tiro Telugu, serif' }}>
                  {album.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <CompactImageLightbox
            items={lightbox.photos.map((p) => ({ url: p.url, caption: p.caption }))}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
