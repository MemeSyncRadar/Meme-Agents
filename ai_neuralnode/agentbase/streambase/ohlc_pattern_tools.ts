import fetch from "node-fetch"

/*------------------------------------------------------
 * Types
 *----------------------------------------------------*/

interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type CandlestickPattern =
  | "Hammer"
  | "ShootingStar"
  | "BullishEngulfing"
  | "BearishEngulfing"
  | "Doji"

export interface PatternSignal {
  timestamp: number
  pattern: CandlestickPattern
  confidence: number
  details?: string
}

/*------------------------------------------------------
 * Detector
 *----------------------------------------------------*/

export class CandlestickPatternDetector {
  constructor(private readonly apiUrl: string) {}

  /* Fetch recent OHLC candles */
  async fetchCandles(symbol: string, limit = 100): Promise<Candle[]> {
    const res = await fetch(`${this.apiUrl}/markets/${symbol}/candles?limit=${limit}`, {
      timeout: 10_000,
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch candles ${res.status}: ${res.statusText}`)
    }
    return (await res.json()) as Candle[]
  }

  /* ------------------------- Pattern helpers ---------------------- */

  private isHammer(c: Candle): number {
    const body = Math.abs(c.close - c.open)
    const lowerWick = Math.min(c.open, c.close) - c.low
    const ratio = body > 0 ? lowerWick / body : 0
    return ratio > 2 && body / (c.high - c.low) < 0.3 ? Math.min(ratio / 3, 1) : 0
  }

  private isShootingStar(c: Candle): number {
    const body = Math.abs(c.close - c.open)
    const upperWick = c.high - Math.max(c.open, c.close)
    const ratio = body > 0 ? upperWick / body : 0
    return ratio > 2 && body / (c.high - c.low) < 0.3 ? Math.min(ratio / 3, 1) : 0
  }

  private isBullishEngulfing(prev: Candle, curr: Candle): number {
    const cond =
      curr.close > curr.open &&
      prev.close < prev.open &&
      curr.close > prev.open &&
      curr.open < prev.close
    if (!cond) return 0
    const bodyPrev = Math.abs(prev.close - prev.open)
    const bodyCurr = Math.abs(curr.close - curr.open)
    return bodyPrev > 0 ? Math.min(bodyCurr / bodyPrev, 1) : 0.8
  }

  private isBearishEngulfing(prev: Candle, curr: Candle): number {
    const cond =
      curr.close < curr.open &&
      prev.close > prev.open &&
      curr.open > prev.close &&
      curr.close < prev.open
    if (!cond) return 0
    const bodyPrev = Math.abs(prev.close - prev.open)
    const bodyCurr = Math.abs(curr.close - curr.open)
    return bodyPrev > 0 ? Math.min(bodyCurr / bodyPrev, 1) : 0.8
  }

  private isDoji(c: Candle): number {
    const range = c.high - c.low
    const body = Math.abs(c.close - c.open)
    const ratio = range > 0 ? body / range : 1
    return ratio < 0.1 ? 1 - ratio * 10 : 0
  }

  /* ------------------------- Detection engine ---------------------- */

  detectPatterns(candles: Candle[]): PatternSignal[] {
    const signals: PatternSignal[] = []
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i]
      const prev = i > 0 ? candles[i - 1] : undefined

      const hammer = this.isHammer(c)
      if (hammer > 0) {
        signals.push({
          timestamp: c.timestamp,
          pattern: "Hammer",
          confidence: hammer,
          details: "Potential bullish reversal signal",
        })
      }

      const star = this.isShootingStar(c)
      if (star > 0) {
        signals.push({
          timestamp: c.timestamp,
          pattern: "ShootingStar",
          confidence: star,
          details: "Potential bearish reversal signal",
        })
      }

      if (prev) {
        const bull = this.isBullishEngulfing(prev, c)
        if (bull > 0) {
          signals.push({
            timestamp: c.timestamp,
            pattern: "BullishEngulfing",
            confidence: bull,
            details: "Strong bullish reversal pattern",
          })
        }

        const bear = this.isBearishEngulfing(prev, c)
        if (bear > 0) {
          signals.push({
            timestamp: c.timestamp,
            pattern: "BearishEngulfing",
            confidence: bear,
            details: "Strong bearish reversal pattern",
          })
        }
      }

      const doji = this.isDoji(c)
      if (doji > 0) {
        signals.push({
          timestamp: c.timestamp,
          pattern: "Doji",
          confidence: doji,
          details: "Indecision, potential reversal or continuation",
        })
      }
    }
    return signals
  }

  summarizeSignals(signals: PatternSignal[]): string {
    if (signals.length === 0) return "No candlestick patterns detected"
    const grouped = signals.reduce<Record<CandlestickPattern, number>>((acc, s) => {
      acc[s.pattern] = (acc[s.pattern] ?? 0) + 1
      return acc
    }, {} as Record<CandlestickPattern, number>)
    return Object.entries(grouped)
      .map(([pattern, count]) => `${pattern}: ${count}`)
      .join(", ")
  }
}
