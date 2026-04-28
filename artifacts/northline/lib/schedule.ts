import type { ScheduledBlock, Settings } from "./types";

export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function generateBlocksForDay(
  date: Date,
  settings: Settings,
): ScheduledBlock[] {
  const dk = dateKeyFromDate(date);
  const start = new Date(date);
  start.setHours(settings.dayStartHour, 0, 0, 0);
  const end = new Date(date);
  end.setHours(settings.dayEndHour, 0, 0, 0);

  const interval = Math.max(5, settings.reminderIntervalMinutes) * 60 * 1000;
  const blocks: ScheduledBlock[] = [];

  for (let t = start.getTime(); t < end.getTime(); t += interval) {
    const startTime = t;
    const endTime = Math.min(t + interval, end.getTime());
    blocks.push({
      id: `${dk}_${startTime}`,
      date: dk,
      startTime,
      endTime,
      status: "pending",
    });
  }
  return blocks;
}

export function mergeStoredWithSchedule(
  schedule: ScheduledBlock[],
  stored: ScheduledBlock[],
  now: number,
): ScheduledBlock[] {
  const storedMap = new Map(stored.map((b) => [b.id, b]));
  return schedule.map((b) => {
    const s = storedMap.get(b.id);
    if (s && s.status === "logged") {
      return { ...b, ...s, status: "logged" };
    }
    if (b.endTime <= now) {
      return { ...b, status: "missed" };
    }
    return { ...b, status: "pending" };
  });
}

export function findCurrentBlock(
  blocks: ScheduledBlock[],
  now: number,
): ScheduledBlock | null {
  return blocks.find((b) => now >= b.startTime && now < b.endTime) ?? null;
}

export function findMissedBlocks(blocks: ScheduledBlock[]): ScheduledBlock[] {
  return blocks.filter((b) => b.status === "missed");
}

export function findLoggedBlocks(blocks: ScheduledBlock[]): ScheduledBlock[] {
  return blocks.filter((b) => b.status === "logged");
}

export function findPendingBlocks(blocks: ScheduledBlock[]): ScheduledBlock[] {
  return blocks.filter((b) => b.status === "pending");
}
