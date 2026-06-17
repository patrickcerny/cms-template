import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import en from "@/i18n/en.json";
import deData from "@/i18n/de.json";
import type { Dictionary, Locale } from "@/i18n/config";

type CmsDictionary = Dictionary;
type CmsContent = Partial<Record<Locale, Partial<CmsDictionary>>>;

const dataDir = path.join(process.cwd(), "data");
const cmsFile = path.join(dataDir, "site-content.json");
const directoryMode = 0o755;
const fileMode = 0o644;

function readCmsContent(): CmsContent {
  if (!existsSync(cmsFile)) return {};
  try {
    return JSON.parse(readFileSync(cmsFile, "utf8")) as CmsContent;
  } catch {
    return {};
  }
}

function mergeDeep<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;

  if (Array.isArray(base) && Array.isArray(override)) {
    return override as T;
  }

  if (typeof base === "object" && base && typeof override === "object" && override && !Array.isArray(override)) {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
      result[key] = mergeDeep((base as Record<string, unknown>)[key], value);
    }
    return result as T;
  }

  return override as T;
}

export function getCmsDictionary(locale: Locale): CmsDictionary {
  const base = locale === "de" ? (deData as CmsDictionary) : en;
  const content = readCmsContent();
  return mergeDeep(base, content[locale] || {}) as CmsDictionary;
}

export function getCmsContent(): CmsContent {
  return readCmsContent();
}

export function saveCmsContent(content: CmsContent) {
  mkdirSync(dataDir, { recursive: true, mode: directoryMode });
  writeFileSync(cmsFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  chmodSync(cmsFile, fileMode);
}
