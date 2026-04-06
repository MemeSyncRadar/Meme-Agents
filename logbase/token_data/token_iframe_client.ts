import type { TokenDataPoint } from "./token_data_fetcher"

export interface DataIframeConfig {
  containerId: string
  iframeUrl: string
  token: string
  refreshMs?: number
  debug?: boolean
}

export class TokenDataIframeEmbedder {
  private iframe?: HTMLIFrameElement
  private refreshTimer?: number

  constructor(private cfg: DataIframeConfig) {}

  async init() {
    const container = document.getElementById(this.cfg.containerId)
    if (!container) throw new Error(`Container not found: ${this.cfg.containerId}`)

    this.iframe = document.createElement("iframe")
    this.iframe.src = this.cfg.iframeUrl
    this.iframe.style.border = "none"
    this.iframe.width = "100%"
    this.iframe.height = "100%"
    this.iframe.onload = () => this.postTokenData()
    container.appendChild(this.iframe)

    if (this.cfg.refreshMs) {
      this.refreshTimer = window.setInterval(
        () => this.postTokenData(),
        this.cfg.refreshMs
      )
    }
  }

  private async postTokenData() {
    if (!this.iframe?.contentWindow) return
    try {
      const fetcher = new (await import("./token_data_fetcher")).TokenDataFetcher(
        this.cfg.iframeUrl
      )
      const data: TokenDataPoint[] = await fetcher.fetchHistory(this.cfg.token)
      const payload = { type: "TOKEN_DATA", token: this.cfg.token, data }
      if (this.cfg.debug) {
        console.log("[TokenDataIframeEmbedder] posting data", payload)
      }
      this.iframe.contentWindow.postMessage(payload, "*")
    } catch (err: any) {
      if (this.cfg.debug) {
        console.error("[TokenDataIframeEmbedder] failed to fetch/post data:", err)
      }
    }
  }

  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    this.iframe?.remove()
    this.iframe = undefined
  }
}
