import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const IOS_APP_ID = 'ca-app-pub-6842527208794655~8983875743';
const IOS_BANNER_ID = 'ca-app-pub-6842527208794655/8983875743';

// Test ad IDs for development
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/2934735716';

const isNative = Capacitor.isNativePlatform();
const isDev = import.meta.env.DEV;

export async function initializeAdMob() {
  if (!isNative) return;

  try {
    await AdMob.initialize({
      initializeForTesting: isDev,
    });
  } catch {
    // AdMob not available
  }
}

export async function showBannerAd() {
  if (!isNative) return;

  try {
    await AdMob.showBanner({
      adId: isDev ? TEST_BANNER_ID : IOS_BANNER_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 60, // above the bottom nav bar
      isTesting: isDev,
    });
  } catch {
    // Banner ad failed to load
  }
}

export async function hideBannerAd() {
  if (!isNative) return;

  try {
    await AdMob.hideBanner();
  } catch {
    // No banner to hide
  }
}

export async function removeBannerAd() {
  if (!isNative) return;

  try {
    await AdMob.removeBanner();
  } catch {
    // No banner to remove
  }
}
