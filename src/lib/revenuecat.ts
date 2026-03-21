/**
 * In-App Purchase helper using @capgo/native-purchases (StoreKit 2)
 * For native iOS: uses StoreKit directly
 * For web: falls back to Supabase subscription check
 */
import { isNative } from "@/lib/native";

// The product ID must match what's in App Store Connect
export const PRODUCT_ID = "com.saranazari.dumpster.pro.lifetime";

/**
 * Purchase the Pro lifetime product on native iOS.
 * Returns true if purchase succeeded.
 */
export async function purchaseProLifetime(): Promise<boolean> {
  if (!isNative) {
    throw new Error("Native purchase only available on iOS");
  }

  const { NativePurchases } = await import("@capgo/native-purchases");

  console.log("[IAP] Starting purchase for product:", PRODUCT_ID);

  const transaction = await NativePurchases.purchaseProduct({
    productIdentifier: PRODUCT_ID,
    productType: "inapp" as any,
  });

  console.log("[IAP] Purchase result:", JSON.stringify(transaction));

  return !!transaction;
}

/**
 * Check if the user already owns the Pro lifetime product.
 */
export async function checkProOwnership(): Promise<boolean> {
  if (!isNative) return false;

  try {
    const { NativePurchases } = await import("@capgo/native-purchases");
    const { transactions } = await NativePurchases.getLatestTransaction({
      productIdentifier: PRODUCT_ID,
    });

    console.log("[IAP] Latest transaction:", JSON.stringify(transactions));
    return transactions != null;
  } catch (err) {
    console.warn("[IAP] Could not check ownership:", err);
    return false;
  }
}

/**
 * Get product info (price, title, etc.) from StoreKit.
 */
export async function getProductInfo() {
  if (!isNative) return null;

  try {
    const { NativePurchases } = await import("@capgo/native-purchases");
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [PRODUCT_ID],
      productType: "inapp" as any,
    });

    console.log("[IAP] Products:", JSON.stringify(products));
    return products?.[0] || null;
  } catch (err) {
    console.warn("[IAP] Could not get product info:", err);
    return null;
  }
}

/**
 * Restore previous purchases (e.g., after reinstalling).
 */
export async function restorePurchases(): Promise<boolean> {
  if (!isNative) return false;

  try {
    const { NativePurchases } = await import("@capgo/native-purchases");
    // Check if the product was previously purchased
    const { transactions } = await NativePurchases.getLatestTransaction({
      productIdentifier: PRODUCT_ID,
    });

    return transactions != null;
  } catch (err) {
    console.warn("[IAP] Restore failed:", err);
    return false;
  }
}

// Keep this for backward compatibility with web SDK usage
export const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";
