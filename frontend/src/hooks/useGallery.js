import { useMemo } from 'react';
import { CHITRALU_CATEGORY } from '../constants/adminConstants';
import { usePublicScriptures } from './usePublicScriptures';
import { usePublicSubcategories } from './usePublicSubcategories';

/** Public gallery reads Chitralu scriptures — same data as Admin → Gallery */
export function useGalleryEvents(options = {}) {
  const scripturesQuery = usePublicScriptures({ parent_category: CHITRALU_CATEGORY }, options);
  const subsQuery = usePublicSubcategories(CHITRALU_CATEGORY, options);

  const data = useMemo(() => {
    const scriptures = (scripturesQuery.data || []).filter((s) => s.images?.length > 0);
    const subs = subsQuery.data || [];

    return scriptures.map((s) => {
      const sub = subs.find((sc) => sc.key === s.subcategory);
      return {
        id: s.id,
        slug: s.id,
        subcategoryKey: s.subcategory,
        label: s.title_telugu,
        label_en: s.title_english || s.title_telugu,
        subLabel: sub?.label_te || sub?.label,
        subLabelEn: sub?.label_en,
      };
    });
  }, [scripturesQuery.data, subsQuery.data]);

  return {
    ...scripturesQuery,
    data,
    isLoading: scripturesQuery.isLoading || subsQuery.isLoading,
    isError: scripturesQuery.isError || subsQuery.isError,
    error: scripturesQuery.error || subsQuery.error,
    refetch: () => Promise.all([scripturesQuery.refetch(), subsQuery.refetch()]),
  };
}

export function useGalleryPhotos(options = {}) {
  const scripturesQuery = usePublicScriptures({ parent_category: CHITRALU_CATEGORY }, options);

  const data = useMemo(() => {
    const flat = [];
    for (const s of scripturesQuery.data || []) {
      for (const [i, img] of (s.images || []).entries()) {
        flat.push({
          id: `${s.id}-${i}`,
          event_slug: s.id,
          eventId: s.id,
          subcategoryKey: s.subcategory,
          url: img.url,
          caption: img.caption || '',
        });
      }
    }
    return flat;
  }, [scripturesQuery.data]);

  return { ...scripturesQuery, data };
}

export function useGallerySubcategories(options = {}) {
  const subsQuery = usePublicSubcategories(CHITRALU_CATEGORY, options);
  const scripturesQuery = usePublicScriptures({ parent_category: CHITRALU_CATEGORY }, options);

  const data = useMemo(() => {
    const subs = subsQuery.data || [];
    const scriptures = (scripturesQuery.data || []).filter((s) => s.images?.length > 0);
    const keys = new Set(scriptures.map((s) => s.subcategory).filter(Boolean));

    return subs
      .filter((sub) => keys.has(sub.key))
      .map((sub) => ({
        id: sub.key,
        label: sub.label_te || sub.label,
        label_en: sub.label_en || sub.label,
        count: scriptures
          .filter((s) => s.subcategory === sub.key)
          .reduce((n, s) => n + (s.images?.length || 0), 0),
      }));
  }, [subsQuery.data, scripturesQuery.data]);

  return {
    ...subsQuery,
    data,
    isLoading: subsQuery.isLoading || scripturesQuery.isLoading,
  };
}
