import axiosInstance from '../lib/axiosInstance';
import { adminUploadSubcategoryImage, adminUploadScriptureImages } from '../lib/apiUrls';
import { compressImageFile, compressImageFiles } from '../utils/compressImage';

const UPLOAD_TIMEOUT_MS = 120000;
const BATCH_SIZE = 12;

async function postMultipart(url, formData) {
  const { data } = await axiosInstance.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return data;
}

export async function uploadSubcategoryImage(file) {
  const compressed = await compressImageFile(file);
  const formData = new FormData();
  formData.append('image', compressed);
  return postMultipart(adminUploadSubcategoryImage, formData);
}

/** Upload many images in parallel batches for faster throughput */
export async function uploadScriptureImages(files) {
  const compressed = await compressImageFiles(files);
  const allUrls = [];

  for (let i = 0; i < compressed.length; i += BATCH_SIZE) {
    const batch = compressed.slice(i, i + BATCH_SIZE);
    const formData = new FormData();
    batch.forEach((file) => formData.append('images', file));
    const data = await postMultipart(adminUploadScriptureImages, formData);
    allUrls.push(...(data.images || []));
  }

  return { images: allUrls };
}
