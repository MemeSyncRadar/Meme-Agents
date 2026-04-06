import nodemailer from "nodemailer"

export interface AlertConfig {
  email?: {
    host: string
    port: number
    user: string
    pass: string
    from: string
    to: string[]
    secure?: boolean
    subjectPrefix?: string
  }
  console?: boolean
  minLevel?: "info" | "warning" | "critical"
}

export interface AlertSignal {
  title: string
  message: string
  level: "info" | "warning" | "critical"
}

const levelOrder: Record<AlertSignal["level"], number> = {
  info: 1,
  warning: 2,
  critical: 3,
}

export class AlertService {
  private transporter?: nodemailer.Transporter
  constructor(private cfg: AlertConfig) {}

  private shouldProcess(level: AlertSignal["level"]): boolean {
    const min = this.cfg.minLevel ?? "info"
    return levelOrder[level] >= levelOrder[min]
  }

  private getTransporter() {
    if (this.transporter) return this.transporter
    if (!this.cfg.email) return undefined
    const { host, port, user, pass, secure } = this.cfg.email
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: Boolean(secure),
      auth: { user, pass },
      pool: true,
    })
    return this.transporter
  }

  private formatSubject(signal: AlertSignal) {
    const prefix = this.cfg.email?.subjectPrefix ?? ""
    const level = signal.level.toUpperCase()
    const base = `[${level}] ${signal.title}`
    return prefix ? `${prefix} ${base}` : base
  }

  private formatText(signal: AlertSignal) {
    const ts = new Date().toISOString()
    return [
      `time: ${ts}`,
      `level: ${signal.level}`,
      `title: ${signal.title}`,
      ``,
      signal.message,
    ].join("\n")
  }

  private async sendEmail(signal: AlertSignal): Promise<boolean> {
    if (!this.cfg.email) return false
    const transporter = this.getTransporter()
    if (!transporter) return false

    const { from, to } = this.cfg.email
    try {
      await transporter.sendMail({
        from,
        to,
        subject: this.formatSubject(signal),
        text: this.formatText(signal),
      })
      return true
    } catch (err) {
      // fall back to console logging on failure
      this.logConsole(
        {
          title: `email delivery failed: ${signal.title}`,
          message:
            `failed to send email for level=${signal.level}\n` +
            `original message:\n${signal.message}\n` +
            `error: ${String(err)}`,
          level: "warning",
        },
        /*force*/ true
      )
      return false
    }
  }

  private logConsole(signal: AlertSignal, force = false) {
    if (!force && !this.cfg.console) return
    const ts = new Date().toISOString()
    const head = `[Alert][${signal.level.toUpperCase()}][${ts}] ${signal.title}`
    if (signal.level === "critical") {
      console.error(`${head}\n${signal.message}`)
    } else if (signal.level === "warning") {
      console.warn(`${head}\n${signal.message}`)
    } else {
      console.log(`${head}\n${signal.message}`)
    }
  }

  async dispatch(signals: AlertSignal[]) {
    for (const sig of signals) {
      if (!this.shouldProcess(sig.level)) continue
      await this.sendEmail(sig)
      this.logConsole(sig)
    }
  }

  async close() {
    if (this.transporter && typeof (this.transporter as any).close === "function") {
      ;(this.transporter as any).close()
    }
  }
}
