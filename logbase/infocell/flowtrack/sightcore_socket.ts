export interface SightCoreConfig {
  url: string
  protocols?: string[]
  reconnectIntervalMs?: number
  autoReconnect?: boolean
  debug?: boolean
}

export type SightCoreMessage = {
  topic: string
  payload: any
  timestamp: number
}

export class SightCoreWebSocket {
  private socket?: WebSocket
  private url: string
  private protocols?: string[]
  private reconnectInterval: number
  private autoReconnect: boolean
  private debug: boolean

  constructor(config: SightCoreConfig) {
    this.url = config.url
    this.protocols = config.protocols
    this.reconnectInterval = config.reconnectIntervalMs ?? 5000
    this.autoReconnect = config.autoReconnect ?? true
    this.debug = config.debug ?? false
  }

  connect(
    onMessage: (msg: SightCoreMessage) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (err: Event) => void
  ): void {
    this.socket = this.protocols
      ? new WebSocket(this.url, this.protocols)
      : new WebSocket(this.url)

    this.socket.onopen = () => {
      if (this.debug) console.log("[SightCore] Connected to", this.url)
      onOpen?.()
    }

    this.socket.onmessage = event => {
      try {
        const msg = JSON.parse(event.data) as SightCoreMessage
        onMessage(msg)
      } catch (err) {
        if (this.debug) console.warn("[SightCore] Invalid message:", event.data)
      }
    }

    this.socket.onclose = () => {
      if (this.debug) console.log("[SightCore] Connection closed")
      onClose?.()
      if (this.autoReconnect) {
        setTimeout(
          () => this.connect(onMessage, onOpen, onClose, onError),
          this.reconnectInterval
        )
      }
    }

    this.socket.onerror = err => {
      if (this.debug) console.error("[SightCore] Error:", err)
      onError?.(err)
      this.socket?.close()
    }
  }

  send(topic: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ topic, payload, timestamp: Date.now() })
      if (this.debug) console.log("[SightCore] Sending:", msg)
      this.socket.send(msg)
    } else if (this.debug) {
      console.warn("[SightCore] Cannot send, socket not open")
    }
  }

  disconnect(): void {
    if (this.debug) console.log("[SightCore] Disconnecting...")
    this.socket?.close()
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}
