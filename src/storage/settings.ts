import { useSyncExternalStore } from 'react';

/**
 * Player-facing app settings, persisted per-browser. Kept tiny and
 * synchronous; components subscribe via useSettings() so a change made
 * in the system menu applies immediately everywhere (e.g. combat tempo).
 */
export interface AppSettings {
  /** Multiplier on combat beat tempo — higher = faster animations. */
  combatSpeed: 1 | 1.5 | 2;
}

const KEY = 'deadlock-tcg-settings';
const DEFAULTS: AppSettings = { combatSpeed: 1 };

let cache: AppSettings | null = null;
const listeners = new Set<() => void>();

export function getSettings(): AppSettings {
  if (!cache) {
    try {
      cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
    } catch {
      cache = { ...DEFAULTS };
    }
  }
  return cache!;
}

export function updateSettings(patch: Partial<AppSettings>): void {
  cache = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Private browsing / quota — the in-memory value still applies.
  }
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** React subscription to the settings store. */
export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribe, getSettings);
}

/** Storage keys owned by the app — the system menu's "reset data" scope. */
export const APP_STORAGE_KEYS = [
  'deadlock-tcg-player',
  'deadlock-tcg-story',
  KEY,
] as const;
