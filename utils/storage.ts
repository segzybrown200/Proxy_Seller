import AsyncStorage from '@react-native-async-storage/async-storage';

const VENDOR_ID_KEY = 'vendorId';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export async function saveVendorId(vendorId: string): Promise<void> {
  if (!vendorId) return;

  if (isBrowser) {
    try {
      window.localStorage.setItem(VENDOR_ID_KEY, vendorId);
      return;
    } catch (_error) {
      // ignore storage failure in browser
    }
  }

  try {
    await AsyncStorage.setItem(VENDOR_ID_KEY, vendorId);
  } catch (_error) {
    // ignore storage failure on native
  }
}

export async function getVendorId(): Promise<string | null> {
  if (isBrowser) {
    try {
      return window.localStorage.getItem(VENDOR_ID_KEY);
    } catch (_error) {
      return null;
    }
  }

  try {
    return await AsyncStorage.getItem(VENDOR_ID_KEY);
  } catch (_error) {
    return null;
  }
}
