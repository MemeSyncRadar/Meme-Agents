/**
 * Analyze on‐chain orderbook depth for a given market.
 */
export interface Order {
  price: number
  size: number
}

export interface DepthMetrics {
  averageBidDepth: number
  averageAskDepth: number
  spread: number
  totalBidVolume: number
  totalAskVolume: number
}

export class TokenDepthAnalyzer {
  constructor(private rpcEndpoint: string, private marketId: string) {}

  async fetchOrderbook(depth = 50): Promise<{ bids: Order[]; asks: Order[] }> {
    const url = `${this.rpcEndpoint}/orderbook/${this.marketId}?depth=${depth}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Orderbook fetch failed: ${res.status}`)
    return await res.json()
  }

  private average(arr: Order[]): number {
    return arr.length ? arr.reduce((s, o) => s + o.size, 0) / arr.length : 0
  }

  private totalVolume(arr: Order[]): number {
    return arr.reduce((s, o) => s + o.size, 0)
  }

  async analyze(depth = 50): Promise<DepthMetrics> {
    const { bids, asks } = await this.fetchOrderbook(depth)
    const bestBid = bids[0]?.price ?? 0
    const bestAsk = asks[0]?.price ?? 0
    return {
      averageBidDepth: this.average(bids),
      averageAskDepth: this.average(asks),
      spread: bestAsk - bestBid,
      totalBidVolume: this.totalVolume(bids),
      totalAskVolume: this.totalVolume(asks),
    }
  }

  async getMidPrice(depth = 10): Promise<number> {
    const { bids, asks } = await this.fetchOrderbook(depth)
    const bestBid = bids[0]?.price ?? 0
    const bestAsk = asks[0]?.price ?? 0
    return bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0
  }
}
