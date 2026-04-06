export interface MetricEntry {
  key: string
  value: number
  updatedAt: number
  source?: string
  tags?: string[]
}

export class MetricsCache {
  private cache = new Map<string, MetricEntry>()

  get(key: string): MetricEntry | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: number, source?: string, tags?: string[]): void {
    this.cache.set(key, {
      key,
      value,
      updatedAt: Date.now(),
      source,
      tags,
    })
  }

  hasRecent(key: string, maxAgeMs: number): boolean {
    const entry = this.cache.get(key)
    return !!entry && Date.now() - entry.updatedAt < maxAgeMs
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  entries(): MetricEntry[] {
    return Array.from(this.cache.values())
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  values(): number[] {
    return Array.from(this.cache.values()).map(e => e.value)
  }

  findByTag(tag: string): MetricEntry[] {
    return Array.from(this.cache.values()).filter(
      e => e.tags && e.tags.includes(tag)
    )
  }

  oldestEntry(): MetricEntry | undefined {
    let oldest: MetricEntry | undefined
    for (const entry of this.cache.values()) {
      if (!oldest || entry.updatedAt < oldest.updatedAt) {
        oldest = entry
      }
    }
    return oldest
  }

  latestEntry(): MetricEntry | undefined {
    let latest: MetricEntry | undefined
    for (const entry of this.cache.values()) {
      if (!latest || entry.updatedAt > latest.updatedAt) {
        latest = entry
      }
    }
    return latest
  }
}
