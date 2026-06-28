import * as userApi from '../api/userApi';
import {
  getBookmarks,
  getReadingProgress,
  getSettings,
} from '../store/useAppStore';
import { isRegisteredUser } from '../store/authStore';

export async function syncLocalDataToServer() {
  if (!isRegisteredUser()) return null;

  const bookmarks = getBookmarks();
  const reading_progress = getReadingProgress().map((p) => ({
    scripture_id: p.scripture_id,
    title_telugu: p.title_telugu || '',
    category: p.category || '',
    progress: p.progress ?? 0,
    last_verse: p.last_verse ?? 0,
    updated_at: p.updated_at || Date.now(),
  }));
  const settings = getSettings();

  if (!bookmarks.length && !reading_progress.length) {
    return userApi.syncUserDataApi({ settings });
  }

  return userApi.syncUserDataApi({ bookmarks, reading_progress, settings });
}
