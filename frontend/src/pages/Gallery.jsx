import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useGalleryEvents, useGalleryPhotos, useGallerySubcategories } from '../hooks/useGallery';

const GOLD = 'linear-gradient(135deg, #C88F2D 0%, #E4B24B 45%, #F6D67A 100%)';
const GOLD_DARK = '#8B6200';
const GOLD_SOLID = '#C88F2D';

function Lightbox({ photos, index, onClose }) {
  const [cur, setCur] = useState(index);
  const photo = photos[cur];
  return (
    <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10">
        <X size={24} />
      </button>
      {cur > 0 && (
        <button onClick={e => { e.stopPropagation(); setCur(c => c - 1); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/40 rounded-full z-10">
          <ChevronLeft size={24} />
        </button>
      )}
      {cur < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setCur(c => c + 1); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/40 rounded-full z-10">
          <ChevronRight size={24} />
        </button>
      )}
      <div onClick={e => e.stopPropagation()} className="max-w-3xl w-full">
        <motion.img key={cur} src={photo.url} alt={photo.caption}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl" />
        {photo.caption && (
          <p className="text-white/80 text-center mt-3 text-sm">{photo.caption}</p>
        )}
        <p className="text-white/40 text-center text-xs mt-1">{cur + 1} / {photos.length}</p>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen" style={{ background: 'hsl(40 43% 95%)' }}>

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
          <div className="flex items-center justify-center gap-2 py-20 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading gallery…</span>
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-2xl py-12 text-center shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
            <p className="text-sm text-gray-500 mb-3">Could not load gallery</p>
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
                background: activeSub === 'all' ? GOLD : 'white',
                color: activeSub === 'all' ? GOLD_DARK : '#6b7280',
                border: activeSub === 'all' ? 'none' : '1px solid #e5e7eb',
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
                    background: active ? GOLD : 'white',
                    color: active ? GOLD_DARK : '#6b7280',
                    border: active ? 'none' : '1px solid #e5e7eb',
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
          <div className="bg-white rounded-2xl py-20 text-center shadow-sm" style={{ border: '1px solid #E4B24B22' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#F6D67A33' }}>
              <Images size={28} color={GOLD_SOLID} strokeWidth={1.5} />
            </div>
            <p className="font-bold text-base" style={{ color: GOLD_DARK, fontFamily: 'Tiro Telugu, serif' }}>
              ఇంకా చిత్రాలు లేవు
            </p>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
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

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {album.photos.map((photo, idx) => (
                  <motion.div key={photo.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="rounded-2xl overflow-hidden cursor-pointer group shadow-sm bg-white relative"
                    style={{ border: '1px solid #E4B24B22' }}
                    onClick={() => setLightbox({ photos: album.photos, index: idx })}>
                    <div className="relative overflow-hidden">
                      <img src={photo.url} alt={photo.caption}
                        className="w-full h-36 sm:h-44 object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all" />
                    </div>
                    {photo.caption && (
                      <p className="px-2.5 py-2 text-xs text-gray-600 truncate">{photo.caption}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photos={lightbox.photos}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
