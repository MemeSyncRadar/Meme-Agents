import type { TokenMetrics } from "./token_analysis_calculator"

export interface IframeConfig {
  containerId: string
  srcUrl: string
  metrics: TokenMetrics
  refreshIntervalMs?: number
  debug?: boolean
}

export class TokenAnalysisIframe {
  private iframeEl: HTMLIFrameElement | null = null
  private refreshTimer?: number

  constructor(private config: IframeConfig) {}

  init(): void {
    const container = document.getElementById(this.config.containerId)
    if (!container) throw new Error("Container not found: " + this.config.containerId)

    const iframe = document.createElement("iframe")
    iframe.src = this.config.srcUrl
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.style.border = "none"
    iframe.onload = () => this.postMetrics()
    container.appendChild(iframe)
    this.iframeEl = iframe

    if (this.config.refreshIntervalMs) {
      this.refreshTimer = window.setInterval(
        () => this.postMetrics(),
        this.config.refreshIntervalMs
      )
    }
  }

  private postMetrics(): void {
    if (!this.iframeEl?.contentWindow) return
    const message = {
      type: "TOKEN_ANALYSIS_METRICS",
      payload: this.config.metrics,
      sentAt: Date.now(),
    }
    this.iframeEl.contentWindow.postMessage(message, "*")
    if (this.config.debug) {
      console.log("[TokenAnalysisIframe] posted metrics", message)
    }
  }

  updateMetrics(metrics: TokenMetrics): void {
    this.config.metrics = metrics
    this.postMetrics()
  }

  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    this.iframeEl?.remove()
    this.iframeEl = null
  }
}
