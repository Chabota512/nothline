import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as storage from "@/lib/storage";
import type { Reflection, TimeBlock } from "@/lib/types";

type Ctx = {
  blocks: TimeBlock[];
  reflections: Reflection[];
  loaded: boolean;
  addBlock: (b: Omit<TimeBlock, "id" | "createdAt">) => Promise<void>;
  updateBlock: (id: string, patch: Partial<TimeBlock>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  addReflection: (r: Omit<Reflection, "id" | "createdAt">) => Promise<void>;
  reflectionForDate: (date: string) => Reflection | undefined;
};

const BlocksCtx = createContext<Ctx | null>(null);

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function sortBlocks(list: TimeBlock[]): TimeBlock[] {
  return [...list].sort((a, b) => a.startTime - b.startTime);
}

export function BlocksProvider({ children }: { children: React.ReactNode }) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const [b, r] = await Promise.all([
        storage.loadBlocks(),
        storage.loadReflections(),
      ]);
      if (cancel) return;
      setBlocks(sortBlocks(b));
      setReflections(r);
      setLoaded(true);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const addBlock = useCallback(
    async (b: Omit<TimeBlock, "id" | "createdAt">) => {
      const next: TimeBlock = { ...b, id: makeId(), createdAt: Date.now() };
      const list = sortBlocks([...blocks, next]);
      setBlocks(list);
      await storage.saveBlocks(list);
    },
    [blocks],
  );

  const updateBlock = useCallback(
    async (id: string, patch: Partial<TimeBlock>) => {
      const list = sortBlocks(
        blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      );
      setBlocks(list);
      await storage.saveBlocks(list);
    },
    [blocks],
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      const list = blocks.filter((b) => b.id !== id);
      setBlocks(list);
      await storage.saveBlocks(list);
    },
    [blocks],
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
      blocks,
      reflections,
      loaded,
      addBlock,
      updateBlock,
      deleteBlock,
      addReflection,
      reflectionForDate,
    }),
    [
      blocks,
      reflections,
      loaded,
      addBlock,
      updateBlock,
      deleteBlock,
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
