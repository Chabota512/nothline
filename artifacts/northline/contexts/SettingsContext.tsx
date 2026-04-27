import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as notifications from "@/lib/notifications";
import * as storage from "@/lib/storage";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/types";

type Ctx = {
  settings: Settings;
  loaded: boolean;
  updateSettings: (patch: Partial<Settings>) => Promise<{
    ok: boolean;
    permissionDenied?: boolean;
  }>;
  testNotification: () => Promise<boolean>;
};

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const s = await storage.loadSettings();
      if (cancel) return;
      setSettings(s);
      setLoaded(true);
      // Re-arm scheduled reminders on app start.
      if (s.reminderEnabled) {
        try {
          await notifications.scheduleReminders(s.reminderIntervalMinutes);
        } catch {
          // ignore
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next: Settings = { ...settings, ...patch };

      if (next.reminderEnabled) {
        const ok = await notifications.requestPermission();
        if (!ok) {
          const fallback: Settings = { ...next, reminderEnabled: false };
          setSettings(fallback);
          await storage.saveSettings(fallback);
          return { ok: false, permissionDenied: true };
        }
        await notifications.scheduleReminders(next.reminderIntervalMinutes);
      } else {
        await notifications.cancelReminders();
      }

      setSettings(next);
      await storage.saveSettings(next);
      return { ok: true };
    },
    [settings],
  );

  const testNotification = useCallback(async () => {
    const ok = await notifications.requestPermission();
    if (!ok) return false;
    await notifications.sendTestNotification();
    return true;
  }, []);

  const value = useMemo(
    () => ({ settings, loaded, updateSettings, testNotification }),
    [settings, loaded, updateSettings, testNotification],
  );

  return (
    <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>
  );
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
