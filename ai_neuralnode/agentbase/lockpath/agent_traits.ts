export interface AgentCapabilities {
  canAnswerProtocolQuestions: boolean
  canAnswerTokenQuestions: boolean
  canDescribeTooling: boolean
  canReportEcosystemNews: boolean
  canTrackWallets?: boolean
  canAnalyzeLiquidity?: boolean
}

export interface AgentFlags {
  requiresExactInvocation: boolean
  noAdditionalCommentary: boolean
  allowParallelExecution?: boolean
  enableDebugLogging?: boolean
}

export const SOLANA_AGENT_CAPABILITIES: AgentCapabilities = {
  canAnswerProtocolQuestions: true,
  canAnswerTokenQuestions: true,
  canDescribeTooling: true,
  canReportEcosystemNews: true,
  canTrackWallets: true,
  canAnalyzeLiquidity: true,
}

export const SOLANA_AGENT_FLAGS: AgentFlags = {
  requiresExactInvocation: true,
  noAdditionalCommentary: true,
  allowParallelExecution: false,
  enableDebugLogging: false,
}

export function describeCapabilities(caps: AgentCapabilities): string {
  const supported: string[] = []
  if (caps.canAnswerProtocolQuestions) supported.push("protocol")
  if (caps.canAnswerTokenQuestions) supported.push("tokens")
  if (caps.canDescribeTooling) supported.push("tooling")
  if (caps.canReportEcosystemNews) supported.push("ecosystem")
  if (caps.canTrackWallets) supported.push("wallet tracking")
  if (caps.canAnalyzeLiquidity) supported.push("liquidity")
  return supported.length > 0 ? supported.join(", ") : "none"
}

export function isStrict(flags: AgentFlags): boolean {
  return flags.requiresExactInvocation && flags.noAdditionalCommentary
}
