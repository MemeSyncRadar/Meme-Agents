import type { Signal } from "./signal_api_client"

/**
 * Processes raw signals into actionable events.
 */
export class SignalProcessor {
  /**
   * Filter signals by type and recency.
   * @param signals Array of Signal
   * @param type Desired signal type
   * @param sinceTimestamp Only include signals after this time
   */
  filter(signals: Signal[], type: string, sinceTimestamp: number): Signal[] {
    return signals.filter(s => s.type === type && s.timestamp > sinceTimestamp)
  }

  /**
   * Aggregate signals by type, counting occurrences.
   * @param signals Array of Signal
   */
  aggregateByType(signals: Signal[]): Record<string, number> {
    return signals.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Group signals by severity.
   */
  groupBySeverity(signals: Signal[]): Record<string, Signal[]> {
    return signals.reduce((acc, s) => {
      const severity = s.severity ?? "unknown"
      if (!acc[severity]) acc[severity] = []
      acc[severity].push(s)
      return acc
    }, {} as Record<string, Signal[]>)
  }

  /**
   * Transform a signal into a human-readable summary string.
   */
  summarize(signal: Signal): string {
    const time = new Date(signal.timestamp).toISOString()
    const severity = signal.severity ? `[${signal.severity.toUpperCase()}] ` : ""
    return `[${time}] ${severity}${signal.type.toUpperCase()}: ${JSON.stringify(signal.payload)}`
  }

  /**
   * Produce statistics for a batch of signals.
   */
  stats(signals: Signal[]): { total: number; byType: Record<string, number> } {
    return {
      total: signals.length,
      byType: this.aggregateByType(signals),
    }
  }
}
