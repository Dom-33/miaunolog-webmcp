import type { AppSettings, CatProfile, JournalEntry } from "./types";
import { STORAGE_KEYS } from "./types";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function listProfiles(): CatProfile[] {
  return readJson<CatProfile[]>(STORAGE_KEYS.profiles, []);
}

export function saveProfiles(list: CatProfile[]) {
  writeJson(STORAGE_KEYS.profiles, list);
}

export function getProfile(id: string): CatProfile | undefined {
  return listProfiles().find((p) => p.id === id);
}

export function upsertProfile(profile: CatProfile) {
  const list = listProfiles();
  const i = list.findIndex((p) => p.id === profile.id);
  if (i >= 0) list[i] = profile;
  else list.push(profile);
  saveProfiles(list);
}

export function deleteProfile(id: string) {
  saveProfiles(listProfiles().filter((p) => p.id !== id));
  const journal = listJournal().filter((e) => e.profileId !== id);
  saveJournal(journal);
  if (getActiveProfileId() === id) setActiveProfileId(null);
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.activeProfileId);
}

export function setActiveProfileId(id: string | null) {
  if (id) localStorage.setItem(STORAGE_KEYS.activeProfileId, id);
  else localStorage.removeItem(STORAGE_KEYS.activeProfileId);
  const s = getSettings();
  s.activeProfileId = id;
  saveSettings(s);
}

export function getActiveProfile(): CatProfile | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return getProfile(id) ?? null;
}

export function listJournal(): JournalEntry[] {
  return readJson<JournalEntry[]>(STORAGE_KEYS.journal, []).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  );
}

export function saveJournal(entries: JournalEntry[]) {
  writeJson(STORAGE_KEYS.journal, entries);
}

export function addJournalEntry(entry: JournalEntry) {
  const list = listJournal();
  list.unshift(entry);
  saveJournal(list);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("miaunolog-journal-change"));
  }
}

export function getSettings(): AppSettings {
  return readJson<AppSettings>(STORAGE_KEYS.settings, {
    locale: "ro",
    activeProfileId: getActiveProfileId(),
    decoderShowProfileChip: true,
  });
}

export function saveSettings(s: AppSettings) {
  writeJson(STORAGE_KEYS.settings, s);
}
