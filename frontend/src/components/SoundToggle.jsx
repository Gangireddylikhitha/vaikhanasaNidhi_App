import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AUDIO_PREF_KEY = 'vaikhanasa-audio-enabled';
const AUDIO_SYNC_EVENT = 'vaikhanasa-audio-sync';
const AUDIO_URL = '/audio.mpeg';

function getGlobalAudio() {
  if (typeof window === 'undefined') return null;
  if (!window.__vaikhanasaAudio) {
    const audio = new Audio(AUDIO_URL);
    audio.loop = true;
    audio.preload = 'auto';
    window.__vaikhanasaAudio = audio;
  }
  return window.__vaikhanasaAudio;
}

function isAudioEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUDIO_PREF_KEY) === '1';
}

function setAudioEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUDIO_PREF_KEY, enabled ? '1' : '0');
  window.dispatchEvent(new CustomEvent(AUDIO_SYNC_EVENT, { detail: { enabled } }));
}

export default function SoundToggle({ className = '', iconSize = 18, title = 'Sound' }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const audio = getGlobalAudio();
    if (!audio) return undefined;

    const syncState = () => {
      const active = isAudioEnabled();
      const actuallyPlaying = active && !audio.paused;
      setEnabled(actuallyPlaying);

      if (!active && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    syncState();

    const onAudioSync = () => syncState();

    const onStorage = (event) => {
      if (event.key === AUDIO_PREF_KEY) syncState();
    };

    const onPlay = () => setEnabled(true);
    const onPause = () => setEnabled(false);

    window.addEventListener(AUDIO_SYNC_EVENT, onAudioSync);
    window.addEventListener('storage', onStorage);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      window.removeEventListener(AUDIO_SYNC_EVENT, onAudioSync);
      window.removeEventListener('storage', onStorage);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  async function toggleSound() {
    const audio = getGlobalAudio();
    if (!audio) return;

    const currentlyEnabled = isAudioEnabled();

    if (currentlyEnabled) {
      audio.pause();
      audio.currentTime = 0;
      setAudioEnabled(false);
      return;
    }

    try {
      await audio.play();
      setAudioEnabled(true);
    } catch {
      setAudioEnabled(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={className}
      style={{ color: '#E4B24B' }}
      title={enabled ? 'Sound On' : 'Sound Off'}
      aria-label={enabled ? 'Turn sound off' : 'Turn sound on'}
      aria-pressed={enabled}
    >
      {enabled ? <Volume2 size={iconSize} /> : <VolumeX size={iconSize} />}
      <span className="sr-only">{title}</span>
    </button>
  );
}
