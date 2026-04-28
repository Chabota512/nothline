import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_SETTINGS,
  type Reflection,
  type ScheduledBlock,
  type Settings,
} from "./types";

const SCHEDULED_BLOCKS_KEY = "@northline:scheduledBlocks:v1";
const REFLECTIONS_KEY = "@northline:reflections:v1";
const ONBOARDING_KEY = "@northline:onboarded:v1";
const SETTINGS_KEY = "@northline:settings:v1";
const LEGACY_BLOCKS_KEY = "@northline:blocks:v1";

export async function loadScheduledBlocks(): Promise<ScheduledBlock[]> {
  // One-time clear of legacy data from the old category model.
  try {
    await AsyncStorage.removeItem(LEGACY_BLOCKS_KEY);
  } catch {
    // ignore
  }
  const raw = await AsyncStorage.getItem(SCHEDULED_BLOCKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ScheduledBlock[];
  } catch {
    return [];
  }
}

export async function saveScheduledBlocks(
  blocks: ScheduledBlock[],
): Promise<void> {
  await AsyncStorage.setItem(SCHEDULED_BLOCKS_KEY, JSON.stringify(blocks));
}

export async function loadReflections(): Promise<Reflection[]> {
  const raw = await AsyncStorage.getItem(REFLECTIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reflection[];
  } catch {
    return [];
  }
}

export async function saveReflections(rs: Reflection[]): Promise<void> {
  await AsyncStorage.setItem(REFLECTIONS_KEY, JSON.stringify(rs));
}

export async function getOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "1";
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
