import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { getSettings } from '../store/useAppStore';
import { handleNativeBack } from './nativeBack';
import { initPushNotifications } from './pushNotifications';

export const isNativeApp = () => Capacitor.isNativePlatform();
export const nativePlatform = () => Capacitor.getPlatform();

export async function syncNativeStatusBar(themeMode = 'dark') {
  if (!isNativeApp() || Capacitor.getPlatform() !== 'android') return;

  try {
    const isLight = themeMode === 'light';
    // Overlay so env(safe-area-inset-top) is correct; CSS pads the headers.
    await StatusBar.setOverlaysWebView({ overlay: true });
    // Capacitor naming: Style.Dark = light icons (for dark UI); Style.Light = dark icons (for light UI).
    await StatusBar.setStyle({ style: isLight ? Style.Light : Style.Dark });
    await StatusBar.setBackgroundColor({ color: isLight ? '#e8e5da' : '#0a0a0a' });
  } catch {
    // Status bar plugin optional during web dev.
  }
}

export async function initNativeShell() {
  if (!isNativeApp()) return;

  try {
    await SplashScreen.hide();
    document.documentElement.classList.add('native-app');
    const themeMode = getSettings().themeMode || 'dark';
    await syncNativeStatusBar(themeMode);
  } catch {
    // Plugins are optional during web dev.
  }

  // Prefer in-app back stack / history over Capacitor's canGoBack (unreliable in SPAs).
  App.addListener('backButton', () => {
    if (!handleNativeBack()) {
      App.exitApp();
    }
  });

  initPushNotifications().catch(() => {
    // Push is optional until google-services + permission are ready
  });
}
