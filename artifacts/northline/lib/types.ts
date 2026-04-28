export type BlockStatus = "pending" | "logged" | "missed";

export type ScheduledBlock = {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  status: BlockStatus;
  primaryActivity?: string;
  secondaryActivity?: string;
  energy?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  loggedAt?: number;
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
  dayStartHour: number;
  dayEndHour: number;
};

export const DEFAULT_SETTINGS: Settings = {
  reminderEnabled: false,
  reminderIntervalMinutes: 60,
  themePreference: "system",
  dayStartHour: 6,
  dayEndHour: 23,
};

export const REMINDER_INTERVAL_OPTIONS = [20, 30, 40, 60, 90];

export const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];
