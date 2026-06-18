/**
 * Node-only loader — reads authored JSON from disk and registers it.
 * Used by tests, content tooling and any server-side rendering path.
 * NOT safe to import in a browser bundle (uses node:fs).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { SubjectCurriculum, SubjectId, Year } from "@kssr/shared";
import { COVERAGE, registerSlice } from "./registry.js";

const HERE = dirname(fileURLToPath(import.meta.url));

const FILE_BY_SUBJECT: Record<SubjectId, string> = {
  math: "math.json",
  bm: "bm.json",
  english: "english.json",
};

function dataPath(year: Year, subject: SubjectId): string {
  return join(HERE, "data", `year${year}`, FILE_BY_SUBJECT[subject]);
}

/** Loads and registers a single slice from disk. */
export function loadFromDisk(year: Year, subject: SubjectId): SubjectCurriculum {
  const path = dataPath(year, subject);
  if (!existsSync(path)) {
    throw new Error(`[curriculum] data file not found: ${path}`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  return registerSlice(raw, year, subject);
}

/** Loads and registers every slice declared in COVERAGE that exists on disk. */
export function loadAllFromDisk(): number {
  let loaded = 0;
  for (const { year, subject } of COVERAGE) {
    if (existsSync(dataPath(year, subject))) {
      loadFromDisk(year, subject);
      loaded++;
    }
  }
  return loaded;
}
