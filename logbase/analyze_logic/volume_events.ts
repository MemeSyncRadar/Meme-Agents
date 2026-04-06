export interface VolumePoint {
  timestamp: number
  volumeUsd: number
}

export interface SpikeEvent {
  timestamp: number
  volume: number
  spikeRatio: number
  avgVolume: number
  windowSize: number
}

/**
 * Detects spikes in trading volume compared to a rolling average window.
 */
export function detectVolumeSpikes(
  points: VolumePoint[],
  windowSize: number = 10,
  spikeThreshold: number = 2.0
): SpikeEvent[] {
  const events: SpikeEvent[] = []
  const volumes = points.map(p => p.volumeUsd)

  for (let i = windowSize; i < volumes.length; i++) {
    const window = volumes.slice(i - windowSize, i)
    const avg = window.reduce((sum, v) => sum + v, 0) / (window.length || 1)
    const curr = volumes[i]
    const ratio = avg > 0 ? curr / avg : Infinity

    if (ratio >= spikeThreshold) {
      events.push({
        timestamp: points[i].timestamp,
        volume: curr,
        spikeRatio: Math.round(ratio * 100) / 100,
        avgVolume: Math.round(avg * 100) / 100,
        windowSize,
      })
    }
  }
  return events
}

/**
 * Finds the largest spike event by ratio.
 */
export function findLargestSpike(events: SpikeEvent[]): SpikeEvent | null {
  if (events.length === 0) return null
  return events.reduce((max, e) => (e.spikeRatio > max.spikeRatio ? e : max))
}

/**
 * Calculates the average spike ratio across events.
 */
export function averageSpikeRatio(events: SpikeEvent[]): number {
  if (events.length === 0) return 0
  const sum = events.reduce((acc, e) => acc + e.spikeRatio, 0)
  return Math.round((sum / events.length) * 100) / 100
}
