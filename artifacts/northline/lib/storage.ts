import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_SETTINGS, type Reflection, type Settings, type TimeBlock } from "./types";

const BLOCKS_KEY = "@northline:blocks:v1";
const REFLECTIONS_KEY = "@northline:reflections:v1";
const ONBOARDING_KEY = "@northline:onboarded:v1";
const SETTINGS_KEY = "@northline:settings:v1";

export async function loadBlocks(): Promise<TimeBlock[]> {
  const raw = await AsyncStorage.getItem(BLOCKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TimeBlock[];
  } catch {
    return [];
  }
}

export async function saveBlocks(blocks: TimeBlock[]): Promise<void> {
  await AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
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
