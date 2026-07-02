import { useMemo } from 'react';
import { CHITRALU_CATEGORY } from '../constants/adminConstants';
import { useScriptures, useSaveScripture, useDeleteScripture } from './useScriptures';
import { useSubcategories, useSaveSubcategory, useDeleteSubcategory } from './useCategories';
import { mergeSubcategories } from '../utils/mergeSubcategories';

function isChitraluAlbum(scripture) {
  if (!scripture) return false;
  return scripture.parent_category === CHITRALU_CATEGORY || scripture.category === CHITRALU_CATEGORY;
}

export function useAdminChitraluAlbums() {
  const scripturesQuery = useScriptures();
  const subsQuery = useSubcategories();

  const albums = useMemo(
    () => (scripturesQuery.data || []).filter(isChitraluAlbum),
    [scripturesQuery.data],
  );

  const chitraluSubs = useMemo(
    () => mergeSubcategories(subsQuery.data || [], CHITRALU_CATEGORY),
    [subsQuery.data],
  );

  const totalPhotos = useMemo(
    () => albums.reduce((n, a) => n + (a.images?.length || 0), 0),
    [albums],
  );

  return {
    albums,
    chitraluSubs,
    totalPhotos,
    isLoading: scripturesQuery.isLoading || subsQuery.isLoading,
    isError: scripturesQuery.isError || subsQuery.isError,
    error: scripturesQuery.error || subsQuery.error,
    refetch: () => Promise.all([scripturesQuery.refetch(), subsQuery.refetch()]),
  };
}

export { useSaveScripture, useDeleteScripture, useSaveSubcategory, useDeleteSubcategory };
