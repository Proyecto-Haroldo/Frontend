export function scoreToStatus(
  score: number,
  thresholds: { warn: number; ok: number } = { warn: 60, ok: 80 }
): 'bad' | 'warn' | 'ok' {
  const s = Number(score ?? 0)
  if (!Number.isFinite(s)) return 'bad'
  if (s < thresholds.warn) return 'bad'
  if (s < thresholds.ok) return 'warn'
  return 'ok'
}