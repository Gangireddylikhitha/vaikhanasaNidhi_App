import axiosInstance from '../lib/axiosInstance';
import { adminUploadSubcategoryImage, adminUploadScriptureImages } from '../lib/apiUrls';

export async function uploadSubcategoryImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await axiosInstance.post(adminUploadSubcategoryImage, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadScriptureImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const { data } = await axiosInstance.post(adminUploadScriptureImages, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
