import { toolkitBuilder } from "@/ai/core"
import { FETCH_POOL_DATA_KEY } from "@/ai/modules/liquidity/pool-fetcher/key"
import { ANALYZE_POOL_HEALTH_KEY } from "@/ai/modules/liquidity/health-checker/key"
import { FetchPoolDataAction } from "@/ai/modules/liquidity/pool-fetcher/action"
import { AnalyzePoolHealthAction } from "@/ai/modules/liquidity/health-checker/action"

type Toolkit = ReturnType<typeof toolkitBuilder>

/**
 * Toolkit exposing liquidity-related actions:
 * – fetch raw pool data
 * – run health / risk analysis on a liquidity pool
 * – perform extended liquidity scoring
 * – generate pool summary snapshots
 */
export const LIQUIDITY_ANALYSIS_TOOLS: Record<string, Toolkit> = Object.freeze({
  [`liquidityscan-${FETCH_POOL_DATA_KEY}`]: toolkitBuilder(new FetchPoolDataAction()),
  [`poolhealth-${ANALYZE_POOL_HEALTH_KEY}`]: toolkitBuilder(new AnalyzePoolHealthAction()),
})

/**
 * Utility functions for liquidity tools
 */
export function listLiquidityToolKeys(): string[] {
  return Object.keys(LIQUIDITY_ANALYSIS_TOOLS)
}

export function describeLiquidityTools(): { id: string; description: string }[] {
  return [
    {
      id: `liquidityscan-${FETCH_POOL_DATA_KEY}`,
      description: "Fetches raw pool data for a given liquidity pool",
    },
    {
      id: `poolhealth-${ANALYZE_POOL_HEALTH_KEY}`,
      description: "Analyzes the health, stability, and risk profile of a liquidity pool",
    },
  ]
}

export function hasLiquidityTool(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(LIQUIDITY_ANALYSIS_TOOLS, id)
}
