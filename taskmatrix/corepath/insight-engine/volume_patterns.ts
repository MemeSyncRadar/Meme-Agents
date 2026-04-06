/**
 * Detect volume‐based patterns in a series of activity amounts.
 */
export interface PatternMatch {
  index: number
  window: number
  average: number
  max: number
  min: number
}

export function detectVolumePatterns(
  volumes: number[],
  windowSize: number,
  threshold: number
): PatternMatch[] {
  const matches: PatternMatch[] = []
  for (let i = 0; i + windowSize <= volumes.length; i++) {
    const slice = volumes.slice(i, i + windowSize)
    const avg = slice.reduce((a, b) => a + b, 0) / windowSize
    const max = Math.max(...slice)
    const min = Math.min(...slice)
    if (avg >= threshold) {
      matches.push({ index: i, window: windowSize, average: avg, max, min })
    }
  }
  return matches
}

/**
 * Find the strongest pattern by highest average.
 */
export function strongestPattern(matches: PatternMatch[]): PatternMatch | null {
  if (matches.length === 0) return null
  return matches.reduce((best, curr) =>
    curr.average > best.average ? curr : best
  )
}

/**
 * Count how many windows exceed the threshold.
 */
export function countPatterns(matches: PatternMatch[]): number {
  return matches.length
}
