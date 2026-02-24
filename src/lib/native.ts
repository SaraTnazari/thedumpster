/**
 * Native platform utilities for iOS (Capacitor)
 * These functions gracefully degrade to no-ops on web
 */

import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';

/** Trigger a light haptic tap */
export async function hapticTap() {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Silently fail on web
  }
}

/** Trigger a success haptic notification */
export async function hapticSuccess() {
  if (!isNative) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Silently fail on web
  }
}

/** Configure the status bar for dark theme */
export async function configureStatusBar() {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#000000' });
  } catch {
    // Silently fail on web
  }
}

/** Hide the splash screen */
export async function hideSplashScreen() {
  if (!isNative) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 500 });
  } catch {
    // Silently fail on web
  }
}

/** Register for push notifications (iOS) */
export async function registerPushNotifications() {
  if (!isNative) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === 'granted') {
      await PushNotifications.register();
    }
  } catch {
    // Silently fail
  }
}
