export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function startOfWeek(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const diff = (dow + 6) % 7; // Monday-start
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

export function dateKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatDuration(ms: number): string {
  const mins = Math.max(0, Math.round(ms / MINUTE));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function relativeMoment(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < MINUTE) return "just now";
  const m = Math.floor(diff / MINUTE);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(diff / HOUR);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function todayLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function weekRangeLabel(start: number): string {
  const end = start + 6 * DAY;
  const s = new Date(start).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const e = new Date(end).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${s} — ${e}`;
}

export function formatHourShort(h: number): string {
  const ampm = h >= 12 ? "pm" : "am";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}${ampm}`;
}

export function greeting(ts: number): string {
  const h = new Date(ts).getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Quiet hours";
}
