const SRT_STAMP = /^(\d+):([0-5]\d):([0-5]\d),(\d{3})$/;
const VTT_STAMP_HOURS = /^(\d+):([0-5]\d):([0-5]\d)\.(\d{1,3})$/;
const VTT_STAMP_SHORT = /^([0-5]\d):([0-5]\d)\.(\d{1,3})$/;
const ASS_STAMP = /^(\d+):([0-5]\d):([0-5]\d)\.(\d{2})$/;

function partsToMs(hours: number, minutes: number, seconds: number, milliseconds: number): number {
  return hours * 3_600_000 + minutes * 60_000 + seconds * 1_000 + milliseconds;
}

function pad(value: number, width: number): string {
  return value.toString().padStart(width, '0');
}

/** Finite, non-negative whole milliseconds. */
export function normalizeMs(ms: number): number {
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.round(ms));
}

export function parseSrtTimestamp(value: string): number | null {
  const match = SRT_STAMP.exec(value.trim());
  if (!match) return null;
  return partsToMs(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
}

export function formatSrtTimestamp(ms: number): string {
  const total = normalizeMs(ms);
  const milliseconds = total % 1000;
  const totalSeconds = Math.floor(total / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

function fractionToMs(fraction: string): number {
  return Number(fraction.padEnd(3, '0'));
}

export function parseVttTimestamp(value: string): number | null {
  const trimmed = value.trim();
  const withHours = VTT_STAMP_HOURS.exec(trimmed);
  if (withHours) {
    return partsToMs(
      Number(withHours[1]),
      Number(withHours[2]),
      Number(withHours[3]),
      fractionToMs(withHours[4]),
    );
  }
  const short = VTT_STAMP_SHORT.exec(trimmed);
  if (!short) return null;
  return partsToMs(0, Number(short[1]), Number(short[2]), fractionToMs(short[3]));
}

export function formatVttTimestamp(ms: number): string {
  const total = normalizeMs(ms);
  const milliseconds = total % 1000;
  const totalSeconds = Math.floor(total / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(milliseconds, 3)}`;
}

/** ASS/SSA `H:MM:SS.CC`, where CC is centiseconds. `0:00:01.00` is 1000 ms. */
export function parseAssTimestamp(value: string): number | null {
  const match = ASS_STAMP.exec(value.trim());
  if (!match) return null;
  const centiseconds = Number(match[4]);
  return partsToMs(Number(match[1]), Number(match[2]), Number(match[3]), centiseconds * 10);
}

export function formatAssTimestamp(ms: number): string {
  const centisecondsTotal = Math.round(normalizeMs(ms) / 10);
  const centiseconds = centisecondsTotal % 100;
  const totalSeconds = Math.floor(centisecondsTotal / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(centiseconds, 2)}`;
}
