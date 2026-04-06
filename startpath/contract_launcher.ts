export interface LaunchConfig {
  contractName: string
  parameters: Record<string, any>
  deployEndpoint: string
  apiKey?: string
  network?: string
  gasLimit?: number
}

export interface LaunchResult {
  success: boolean
  address?: string
  transactionHash?: string
  network?: string
  error?: string
  deployedAt?: number
}

export class LaunchNode {
  constructor(private config: LaunchConfig) {}

  async deploy(): Promise<LaunchResult> {
    const { deployEndpoint, apiKey, contractName, parameters, network, gasLimit } = this.config
    try {
      const res = await fetch(deployEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ contractName, parameters, network, gasLimit }),
      })
      if (!res.ok) {
        const text = await res.text()
        return { success: false, error: `HTTP ${res.status}: ${text}` }
      }
      const json = await res.json()
      return {
        success: true,
        address: json.contractAddress,
        transactionHash: json.txHash,
        network: json.network ?? network,
        deployedAt: Date.now(),
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  async validateDeployment(address: string): Promise<boolean> {
    try {
      const url = `${this.config.deployEndpoint}/status/${encodeURIComponent(address)}`
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
      })
      if (!res.ok) return false
      const json = await res.json()
      return json.status === "confirmed"
    } catch {
      return false
    }
  }
}
