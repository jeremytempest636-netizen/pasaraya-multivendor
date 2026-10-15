"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false saat render di server dan render pertama di klien, true sesudahnya.
 * Dipakai agar UI yang bergantung pada localStorage (login, keranjang) tidak memicu hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
