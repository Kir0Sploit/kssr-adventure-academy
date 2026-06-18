/**
 * Bundler-static loader — for browser clients (Next.js / Vite).
 *
 * The JSON is imported directly so the bundler inlines it into the client
 * bundle. Call `loadBundledCurriculum()` once at app startup before using
 * the registry. Importing this module has no side effects until called.
 */
import { registerSlice } from "./registry.js";

import y1math from "./data/year1/math.json" with { type: "json" };
import y1bm from "./data/year1/bm.json" with { type: "json" };
import y1en from "./data/year1/english.json" with { type: "json" };
import y2math from "./data/year2/math.json" with { type: "json" };
import y2bm from "./data/year2/bm.json" with { type: "json" };
import y2en from "./data/year2/english.json" with { type: "json" };
import y3math from "./data/year3/math.json" with { type: "json" };
import y3bm from "./data/year3/bm.json" with { type: "json" };
import y3en from "./data/year3/english.json" with { type: "json" };
import y4math from "./data/year4/math.json" with { type: "json" };
import y4bm from "./data/year4/bm.json" with { type: "json" };
import y4en from "./data/year4/english.json" with { type: "json" };
import y5math from "./data/year5/math.json" with { type: "json" };
import y5bm from "./data/year5/bm.json" with { type: "json" };
import y5en from "./data/year5/english.json" with { type: "json" };
import y6math from "./data/year6/math.json" with { type: "json" };
import y6bm from "./data/year6/bm.json" with { type: "json" };
import y6en from "./data/year6/english.json" with { type: "json" };

let loaded = false;

/** Registers all bundled curriculum slices. Idempotent. */
export function loadBundledCurriculum(): void {
  if (loaded) return;
  registerSlice(y1math, 1, "math");
  registerSlice(y1bm, 1, "bm");
  registerSlice(y1en, 1, "english");
  registerSlice(y2math, 2, "math");
  registerSlice(y2bm, 2, "bm");
  registerSlice(y2en, 2, "english");
  registerSlice(y3math, 3, "math");
  registerSlice(y3bm, 3, "bm");
  registerSlice(y3en, 3, "english");
  registerSlice(y4math, 4, "math");
  registerSlice(y4bm, 4, "bm");
  registerSlice(y4en, 4, "english");
  registerSlice(y5math, 5, "math");
  registerSlice(y5bm, 5, "bm");
  registerSlice(y5en, 5, "english");
  registerSlice(y6math, 6, "math");
  registerSlice(y6bm, 6, "bm");
  registerSlice(y6en, 6, "english");
  loaded = true;
}
