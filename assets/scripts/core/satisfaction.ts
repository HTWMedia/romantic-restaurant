export const MAX_SATISFACTION = 100;
export const DEFAULT_MAX_WAIT = 30; // 秒

export function satisfactionAfterWaiting(
  start: number,
  waited: number,
  maxWait: number = DEFAULT_MAX_WAIT,
): number {
  const next = start - (start / maxWait) * waited;
  return Math.max(0, Math.min(start, Math.round(next)));
}

export function payRatio(satisfaction: number): number {
  return Math.max(0, Math.min(1, satisfaction / MAX_SATISFACTION));
}

export function paidAmount(price: number, satisfaction: number): number {
  return Math.round(price * payRatio(satisfaction));
}
