export interface PricePoint {
  timestamp: number
  priceUsd: number
}

export interface TrendResult {
  startTime: number
  endTime: number
  trend: "upward" | "downward" | "neutral"
  changePct: number
  duration: number
  pointsCount: number
}

/**
 * Analyze a series of price points to determine overall trend segments.
 */
export function analyzePriceTrends(
  points: PricePoint[],
  minSegmentLength: number = 5
): TrendResult[] {
  const results: TrendResult[] = []
  if (points.length < minSegmentLength) return results

  let segStart = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].priceUsd
    const curr = points[i].priceUsd
    const direction = curr > prev ? 1 : curr < prev ? -1 : 0

    const isLastPoint = i === points.length - 1
    const nextTurns =
      (direction === 1 && points[i + 1] && points[i + 1].priceUsd < curr) ||
      (direction === -1 && points[i + 1] && points[i + 1].priceUsd > curr)

    if (i - segStart >= minSegmentLength && (isLastPoint || nextTurns)) {
      const start = points[segStart]
      const end = points[i]
      const changePct = ((end.priceUsd - start.priceUsd) / start.priceUsd) * 100
      results.push({
        startTime: start.timestamp,
        endTime: end.timestamp,
        trend: changePct > 0 ? "upward" : changePct < 0 ? "downward" : "neutral",
        changePct: Math.round(changePct * 100) / 100,
        duration: end.timestamp - start.timestamp,
        pointsCount: i - segStart + 1,
      })
      segStart = i
    }
  }
  return results
}

/**
 * Get the strongest trend from a list of trend results (by absolute % change).
 */
export function strongestTrend(trends: TrendResult[]): TrendResult | null {
  if (trends.length === 0) return null
  return trends.reduce((max, t) =>
    Math.abs(t.changePct) > Math.abs(max.changePct) ? t : max
  )
}

/**
 * Get average percentage change across all segments.
 */
export function averageTrendChange(trends: TrendResult[]): number {
  if (trends.length === 0) return 0
  const sum = trends.reduce((acc, t) => acc + t.changePct, 0)
  return Math.round((sum / trends.length) * 100) / 100
}
