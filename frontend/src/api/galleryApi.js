import axiosInstance from '../lib/axiosInstance';
import {
  galleryEvents,
  galleryPhotos,
  adminGalleryEvents,
  adminGalleryEventBySlug,
  adminGalleryPhotos,
  adminGalleryPhotoById,
  adminUploadGalleryPhotos,
} from '../lib/apiUrls';

export async function fetchGalleryEvents() {
  const { data } = await axiosInstance.get(galleryEvents);
  return data;
}

export async function fetchGalleryPhotos(eventSlug) {
  const { data } = await axiosInstance.get(galleryPhotos, {
    params: eventSlug ? { event: eventSlug } : undefined,
  });
  return data;
}

export async function fetchAdminGalleryEvents() {
  const { data } = await axiosInstance.get(adminGalleryEvents);
  return data;
}

export async function createGalleryEvent(payload) {
  const { data } = await axiosInstance.post(adminGalleryEvents, payload);
  return data;
}

export async function updateGalleryEvent(slug, payload) {
  const { data } = await axiosInstance.put(adminGalleryEventBySlug(slug), payload);
  return data;
}

export async function deleteGalleryEvent(slug) {
  const { data } = await axiosInstance.delete(adminGalleryEventBySlug(slug));
  return data;
}

export async function saveGalleryPhotos(eventSlug, photos) {
  const { data } = await axiosInstance.post(adminGalleryPhotos, {
    event_slug: eventSlug,
    photos,
  });
  return data;
}

export async function deleteGalleryPhoto(id) {
  const { data } = await axiosInstance.delete(adminGalleryPhotoById(id));
  return data;
}

export async function uploadGalleryPhotos(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const { data } = await axiosInstance.post(adminUploadGalleryPhotos, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
