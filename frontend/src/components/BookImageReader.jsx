import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import BookVisualReaderLayout from './BookVisualReaderLayout';

function sortPageImages(images) {
  return [...(images || [])].sort((a, b) => {
    const pa = a.page_number || 0;
    const pb = b.page_number || 0;
    if (pa && pb) return pa - pb;
    return 0;
  });
}

export default function BookImageReader({
  scripture,
  images,
  initialPage = 0,
  onProgress,
}) {
  const pages = useMemo(() => sortPageImages(images), [images]);
  const totalPages = pages.length;
  const [pageIdx, setPageIdx] = useState(() => Math.min(Math.max(0, initialPage), Math.max(0, totalPages - 1)));
  const pageIdxRef = useRef(pageIdx);

  useEffect(() => {
    pageIdxRef.current = pageIdx;
  }, [pageIdx]);

  useEffect(() => {
    setPageIdx(Math.min(Math.max(0, initialPage), Math.max(0, totalPages - 1)));
  }, [initialPage, totalPages, scripture?.id]);

  const reportPage = useCallback((idx) => {
    const next = Math.min(Math.max(0, idx), totalPages - 1);
    if (next === pageIdxRef.current) return;
    setPageIdx(next);
    const pct = totalPages > 1 ? Math.round((next / (totalPages - 1)) * 100) : 100;
    onProgress?.(pct, next);
  }, [totalPages, onProgress]);

  const goTo = useCallback((idx) => {
    reportPage(idx);
  }, [reportPage]);

  if (!totalPages) {
    return (
      <p className="text-center text-muted text-sm py-12 font-telugu" style={{ fontFamily: 'Tiro Telugu, serif' }}>
        ఈ పుస్తకానికి పుట చిత్రాలు లేవు.
      </p>
    );
  }

  return (
    <BookVisualReaderLayout
      scripture={scripture}
      pageIdx={pageIdx}
      totalPages={totalPages}
      onGoTo={goTo}
      onVisiblePage={reportPage}
    >
      {pages.map((page, i) => (
        <img
          key={page.url || i}
          src={page.url}
          alt={`${scripture.title_telugu} — page ${page.page_number || i + 1}`}
          className="book-scroll-page-img"
          loading={i < 3 || Math.abs(i - pageIdx) <= 2 ? 'eager' : 'lazy'}
          draggable={false}
        />
      ))}
    </BookVisualReaderLayout>
  );
}
