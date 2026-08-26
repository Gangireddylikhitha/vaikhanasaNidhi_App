import { useState, useEffect, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import axiosInstance from '../lib/axiosInstance';
import { scripturePdf } from '../lib/apiUrls';
import BookVisualReaderLayout from './BookVisualReaderLayout';
import { brandLogo } from '../constants/brandAssets';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const RENDER_SCALE = 2;
const PRELOAD_RADIUS = 3;

async function fetchPdfArrayBuffer(pdfUrl, scriptureId) {
  try {
    const direct = await fetch(pdfUrl, { mode: 'cors' });
    if (direct.ok) return direct.arrayBuffer();
  } catch {
    // Cloudinary raw PDFs often block cross-origin fetch — use API proxy
  }

  const { data } = await axiosInstance.get(scripturePdf(scriptureId), {
    responseType: 'arraybuffer',
    timeout: 120000,
  });
  return data;
}

async function renderPdfPage(pdfDoc, pageNumber, scale) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.88);
}

export default function BookPdfReader({
  scripture,
  pdfUrl,
  pageCount = 0,
  initialPage = 0,
  onProgress,
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageIdx, setPageIdx] = useState(() => Math.max(0, initialPage));
  const [pageSrcs, setPageSrcs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageIdxRef = useRef(pageIdx);
  const renderingRef = useRef(new Set());
  const loadedRef = useRef(new Set());

  const totalPages = pdfDoc?.numPages || pageCount || 1;

  useEffect(() => {
    pageIdxRef.current = pageIdx;
  }, [pageIdx]);

  useEffect(() => {
    setPageIdx(Math.min(Math.max(0, initialPage), Math.max(0, totalPages - 1)));
  }, [initialPage, totalPages, scripture?.id]);

  useEffect(() => {
    const url = pdfUrl?.trim();
    if (!url) {
      setLoading(false);
      setPdfDoc(null);
      setPageSrcs({});
      setError('No PDF file linked to this book. Re-import using PDF book mode in admin.');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setPdfDoc(null);
    setPageSrcs({});
    renderingRef.current = new Set();
    loadedRef.current = new Set();

    (async () => {
      try {
        const data = await fetchPdfArrayBuffer(url, scripture.id);
        const doc = await pdfjsLib.getDocument({ data, disableRange: true }).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load PDF. Check your connection or re-upload the book.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [pdfUrl, scripture?.id]);

  // Lazy-render pages around the visible page (CSS handles zoom — no re-render on zoom)
  useEffect(() => {
    if (!pdfDoc) return undefined;
    let cancelled = false;

    async function ensurePage(i) {
      if (i < 0 || i >= pdfDoc.numPages) return;
      if (loadedRef.current.has(i) || renderingRef.current.has(i)) return;
      renderingRef.current.add(i);
      try {
        const src = await renderPdfPage(pdfDoc, i + 1, RENDER_SCALE);
        if (!cancelled) {
          loadedRef.current.add(i);
          setPageSrcs((prev) => (prev[i] ? prev : { ...prev, [i]: src }));
        }
      } catch {
        // ignore single-page render errors
      } finally {
        renderingRef.current.delete(i);
      }
    }

    const center = pageIdx;
    const jobs = [];
    for (let d = 0; d <= PRELOAD_RADIUS; d += 1) {
      jobs.push(ensurePage(center + d));
      if (d > 0) jobs.push(ensurePage(center - d));
    }
    if (center <= 2) {
      for (let i = 0; i < Math.min(6, pdfDoc.numPages); i += 1) jobs.push(ensurePage(i));
    }
    Promise.all(jobs);

    return () => { cancelled = true; };
  }, [pdfDoc, pageIdx]);

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

  if (error && !pdfDoc) {
    return (
      <p className="text-center text-red-400 text-sm py-12 px-4">{error}</p>
    );
  }

  if (loading && !pdfDoc) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 w-full">
        <img src={brandLogo} alt="" className="brand-loader" width={56} height={56} />
        <p className="text-xs text-muted">Loading PDF…</p>
      </div>
    );
  }

  return (
    <BookVisualReaderLayout
      scripture={scripture}
      pageIdx={pageIdx}
      totalPages={totalPages}
      loading={loading}
      onGoTo={goTo}
      onVisiblePage={reportPage}
    >
      {Array.from({ length: totalPages }, (_, i) => (
        pageSrcs[i] ? (
          <img
            key={`pdf-${i}`}
            src={pageSrcs[i]}
            alt={`${scripture.title_telugu} — page ${i + 1}`}
            className="book-scroll-page-img"
            draggable={false}
          />
        ) : (
          <div key={`pdf-ph-${i}`} className="book-scroll-page-placeholder">
            <img src={brandLogo} alt="" className="brand-loader brand-loader--sm" width={32} height={32} />
            <span className="text-xs text-muted tabular-nums">Page {i + 1}</span>
          </div>
        )
      ))}
    </BookVisualReaderLayout>
  );
}
