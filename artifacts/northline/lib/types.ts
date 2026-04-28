export type BuildCategory =
  | "skill"
  | "body"
  | "wealth"
  | "people"
  | "mind"
  | "drift";

export const BUILD_CATEGORIES: {
  id: BuildCategory;
  label: string;
}[] = [
  { id: "skill", label: "Skill" },
  { id: "body", label: "Body" },
  { id: "wealth", label: "Wealth" },
  { id: "people", label: "People" },
  { id: "mind", label: "Mind" },
  { id: "drift", label: "Leisure" },
];

export type TimeBlock = {
  id: string;
  startTime: number;
  endTime: number;
  primaryActivity: string;
  secondaryActivity?: string;
  builds?: BuildCategory;
  energy?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  isReconstructed: boolean;
  createdAt: number;
};

export type Reflection = {
  id: string;
  date: string;
  stoleTime?: string;
  worked?: string;
  energy?: 1 | 2 | 3 | 4 | 5;
  createdAt: number;
};

export type ThemePreference = "system" | "light" | "dark";

export type Settings = {
  reminderEnabled: boolean;
  reminderIntervalMinutes: number;
  themePreference: ThemePreference;
};

export const DEFAULT_SETTINGS: Settings = {
  reminderEnabled: false,
  reminderIntervalMinutes: 40,
  themePreference: "system",
};

export const REMINDER_INTERVAL_OPTIONS = [20, 30, 40, 60, 90];

export const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];
