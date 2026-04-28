import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSettings } from "@/contexts/SettingsContext";
import {
  findCurrentBlock,
  findMissedBlocks,
  generateBlocksForDay,
  mergeStoredWithSchedule,
} from "@/lib/schedule";
import * as notifications from "@/lib/notifications";
import * as storage from "@/lib/storage";
import type { Reflection, ScheduledBlock } from "@/lib/types";

type LogPayload = {
  primaryActivity: string;
  secondaryActivity?: string;
  energy?: 1 | 2 | 3 | 4 | 5;
  note?: string;
};

type Ctx = {
  todayBlocks: ScheduledBlock[];
  allLoggedBlocks: ScheduledBlock[];
  reflections: Reflection[];
  loaded: boolean;
  currentBlock: ScheduledBlock | null;
  missedBlocks: ScheduledBlock[];
  logBlock: (blockId: string, data: LogPayload) => Promise<void>;
  addReflection: (r: Omit<Reflection, "id" | "createdAt">) => Promise<void>;
  reflectionForDate: (date: string) => Reflection | undefined;
};

const BlocksCtx = createContext<Ctx | null>(null);

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function BlocksProvider({ children }: { children: React.ReactNode }) {
  const { settings, loaded: settingsLoaded } = useSettings();
  const [storedBlocks, setStoredBlocks] = useState<ScheduledBlock[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Load persisted state once.
  useEffect(() => {
    let cancel = false;
    (async () => {
      const [b, r] = await Promise.all([
        storage.loadScheduledBlocks(),
        storage.loadReflections(),
      ]);
      if (cancel) return;
      setStoredBlocks(b);
      setReflections(r);
      setLoaded(true);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // Tick `now` every 30s so pending blocks roll into "missed" without
  // requiring user interaction.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const todaySchedule = useMemo(() => {
    if (!settingsLoaded) return [];
    return generateBlocksForDay(new Date(now), settings);
  }, [settingsLoaded, settings, now]);

  const todayBlocks = useMemo(
    () => mergeStoredWithSchedule(todaySchedule, storedBlocks, now),
    [todaySchedule, storedBlocks, now],
  );

  // Schedule block-end notifications whenever today's blocks change.
  useEffect(() => {
    notifications.scheduleBlockNotifications(todayBlocks).catch((e) => {
      console.error("Error scheduling block notifications:", e);
    });
  }, [todayBlocks]);

  const currentBlock = useMemo(
    () => findCurrentBlock(todayBlocks, now),
    [todayBlocks, now],
  );

  const missedBlocks = useMemo(
    () => findMissedBlocks(todayBlocks),
    [todayBlocks],
  );

  const allLoggedBlocks = useMemo(
    () => storedBlocks.filter((b) => b.status === "logged"),
    [storedBlocks],
  );

  const logBlock = useCallback(
    async (blockId: string, data: LogPayload) => {
      // Find the block by id in today's merged schedule, or fall back to
      // the stored list (in case it's an older day).
      const fromToday = todayBlocks.find((b) => b.id === blockId);
      const fromStored = storedBlocks.find((b) => b.id === blockId);
      const base = fromToday ?? fromStored;
      if (!base) return;

      const updated: ScheduledBlock = {
        ...base,
        status: "logged",
        primaryActivity: data.primaryActivity.trim(),
        secondaryActivity: data.secondaryActivity?.trim() || undefined,
        energy: data.energy,
        note: data.note?.trim() || undefined,
        loggedAt: Date.now(),
      };
      const next = [
        ...storedBlocks.filter((b) => b.id !== blockId),
        updated,
      ].sort((a, b) => a.startTime - b.startTime);
      setStoredBlocks(next);
      await storage.saveScheduledBlocks(next);
    },
    [storedBlocks, todayBlocks],
  );

  const addReflection = useCallback(
    async (r: Omit<Reflection, "id" | "createdAt">) => {
      const next: Reflection = { ...r, id: makeId(), createdAt: Date.now() };
      const list = [...reflections.filter((x) => x.date !== r.date), next];
      setReflections(list);
      await storage.saveReflections(list);
    },
    [reflections],
  );

  const reflectionForDate = useCallback(
    (date: string) => reflections.find((r) => r.date === date),
    [reflections],
  );

  const value = useMemo(
    () => ({
      todayBlocks,
      allLoggedBlocks,
      reflections,
      loaded: loaded && settingsLoaded,
      currentBlock,
      missedBlocks,
      logBlock,
      addReflection,
      reflectionForDate,
    }),
    [
      todayBlocks,
      allLoggedBlocks,
      reflections,
      loaded,
      settingsLoaded,
      currentBlock,
      missedBlocks,
      logBlock,
      addReflection,
      reflectionForDate,
    ],
  );

  return <BlocksCtx.Provider value={value}>{children}</BlocksCtx.Provider>;
}

export function useBlocks(): Ctx {
  const ctx = useContext(BlocksCtx);
  if (!ctx) throw new Error("useBlocks must be used inside BlocksProvider");
  return ctx;
}
