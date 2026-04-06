export interface TokenDataPoint {
  timestamp: number
  priceUsd: number
  volumeUsd: number
  marketCapUsd: number
  circulatingSupply?: number
}

export class TokenDataFetcher {
  constructor(private apiBase: string) {}

  /**
   * Fetches an array of TokenDataPoint for the given token symbol.
   * Expects endpoint: `${apiBase}/tokens/${symbol}/history`
   */
  async fetchHistory(symbol: string): Promise<TokenDataPoint[]> {
    const res = await fetch(`${this.apiBase}/tokens/${encodeURIComponent(symbol)}/history`)
    if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}: ${res.status}`)
    const raw = (await res.json()) as any[]
    return raw.map(r => ({
      timestamp: r.time * 1000,
      priceUsd: Number(r.priceUsd),
      volumeUsd: Number(r.volumeUsd),
      marketCapUsd: Number(r.marketCapUsd),
      circulatingSupply: r.circulatingSupply ? Number(r.circulatingSupply) : undefined,
    }))
  }

  /**
   * Fetch current data snapshot for a token.
   * Expects endpoint: `${apiBase}/tokens/${symbol}`
   */
  async fetchCurrent(symbol: string): Promise<TokenDataPoint> {
    const res = await fetch(`${this.apiBase}/tokens/${encodeURIComponent(symbol)}`)
    if (!res.ok) throw new Error(`Failed to fetch current data for ${symbol}: ${res.status}`)
    const r = (await res.json()) as any
    return {
      timestamp: Date.now(),
      priceUsd: Number(r.priceUsd),
      volumeUsd: Number(r.volumeUsd),
      marketCapUsd: Number(r.marketCapUsd),
      circulatingSupply: r.circulatingSupply ? Number(r.circulatingSupply) : undefined,
    }
  }

  /**
   * Fetch history within a specific time range.
   */
  async fetchRange(symbol: string, start: number, end: number): Promise<TokenDataPoint[]> {
    const url = `${this.apiBase}/tokens/${encodeURIComponent(symbol)}/history?start=${Math.floor(
      start / 1000
    )}&end=${Math.floor(end / 1000)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch range data for ${symbol}: ${res.status}`)
    const raw = (await res.json()) as any[]
    return raw.map(r => ({
      timestamp: r.time * 1000,
      priceUsd: Number(r.priceUsd),
      volumeUsd: Number(r.volumeUsd),
      marketCapUsd: Number(r.marketCapUsd),
      circulatingSupply: r.circulatingSupply ? Number(r.circulatingSupply) : undefined,
    }))
  }
}
