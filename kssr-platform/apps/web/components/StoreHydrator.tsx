"use client";
import { useEffect } from "react";
import { useProgress } from "@/lib/store";

/**
 * Rehydrates the persisted progress store AFTER mount. The store uses
 * `skipHydration` so the first client render matches the server (defaults),
 * which avoids React hydration mismatches from localStorage-backed state
 * (e.g. the chosen language). Renders nothing.
 */
export default function StoreHydrator() {
  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);
  return null;
}
