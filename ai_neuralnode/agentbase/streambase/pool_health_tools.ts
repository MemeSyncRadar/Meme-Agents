import { toolkitBuilder } from "@/ai/core"
import { FETCH_POOL_DATA_KEY } from "@/ai/modules/liquidity/pool-fetcher/key"
import { ANALYZE_POOL_HEALTH_KEY } from "@/ai/modules/liquidity/health-checker/key"
import { FetchPoolDataAction } from "@/ai/modules/liquidity/pool-fetcher/action"
import { AnalyzePoolHealthAction } from "@/ai/modules/liquidity/health-checker/action"

type Toolkit = ReturnType<typeof toolkitBuilder>

/**
 * Extended liquidity tools:
 * – fetch raw pool data
 * – run health / risk analysis on liquidity pools
 * – provide summaries and scoring helpers
 */
export const EXTENDED_LIQUIDITY_TOOLS: Record<string, Toolkit> = Object.freeze({
  [`liquidityscan-${FETCH_POOL_DATA_KEY}`]: toolkitBuilder(new FetchPoolDataAction()),
  [`poolhealth-${ANALYZE_POOL_HEALTH_KEY}`]: toolkitBuilder(new AnalyzePoolHealthAction()),
})

/**
 * Helper functions to work with extended liquidity tools
 */
export function getExtendedLiquidityToolKeys(): string[] {
  return Object.keys(EXTENDED_LIQUIDITY_TOOLS)
}

export function describeExtendedLiquidityTools(): { id: string; description: string }[] {
  return [
    {
      id: `liquidityscan-${FETCH_POOL_DATA_KEY}`,
      description: "Fetches on-chain raw pool data including volume, liquidity, and reserves",
    },
    {
      id: `poolhealth-${ANALYZE_POOL_HEALTH_KEY}`,
      description: "Analyzes liquidity pool health, highlighting risks and stability metrics",
    },
  ]
}

export function isExtendedLiquidityTool(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(EXTENDED_LIQUIDITY_TOOLS, id)
}
