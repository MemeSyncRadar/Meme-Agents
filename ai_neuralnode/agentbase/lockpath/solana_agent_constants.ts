export const SOLANA_KNOWLEDGE_AGENT_ID = "solana-knowledge-agent" as const

export const SOLANA_KNOWLEDGE_AGENT_VERSION = "1.0.0" as const

export const SOLANA_KNOWLEDGE_AGENT_LABEL = "Solana Knowledge Agent"

export const SOLANA_KNOWLEDGE_AGENT_DESCRIPTION =
  "Agent specialized in answering Solana protocol, token, wallet, staking, and ecosystem-related questions."

export function getSolanaKnowledgeAgentInfo() {
  return {
    id: SOLANA_KNOWLEDGE_AGENT_ID,
    version: SOLANA_KNOWLEDGE_AGENT_VERSION,
    label: SOLANA_KNOWLEDGE_AGENT_LABEL,
    description: SOLANA_KNOWLEDGE_AGENT_DESCRIPTION,
  }
}
