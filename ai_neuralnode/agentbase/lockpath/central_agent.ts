import type { BaseAction, ActionResponse } from "./base_action"
import { z } from "zod"

interface AgentContext {
  apiEndpoint: string
  apiKey: string
  timeoutMs?: number
  metadata?: Record<string, any>
}

/**
 * Central Agent: routes calls to registered actions.
 */
export class Agent {
  private actions = new Map<string, BaseAction<any, any, AgentContext>>()

  register<S, R>(action: BaseAction<S, R, AgentContext>): void {
    if (this.actions.has(action.id)) {
      throw new Error(`Action with id "${action.id}" is already registered.`)
    }
    this.actions.set(action.id, action)
  }

  unregister(id: string): boolean {
    return this.actions.delete(id)
  }

  listActions(): { id: string; summary: string }[] {
    return Array.from(this.actions.values()).map(a => ({
      id: a.id,
      summary: a.summary,
    }))
  }

  getAction(id: string): BaseAction<any, any, AgentContext> | undefined {
    return this.actions.get(id)
  }

  async invoke<R>(
    actionId: string,
    payload: unknown,
    ctx: AgentContext
  ): Promise<ActionResponse<R>> {
    const action = this.actions.get(actionId)
    if (!action) throw new Error(`Unknown action "${actionId}"`)

    const validation = action.validate(payload)
    if (!validation.success) {
      return {
        notice: `Validation failed for action "${actionId}"`,
        error: validation.errors?.join("; "),
        timestamp: Date.now(),
      }
    }

    return action.execute({
      payload: payload as z.infer<typeof action.input>,
      context: ctx,
    }) as Promise<ActionResponse<R>>
  }

  clear(): void {
    this.actions.clear()
  }

  size(): number {
    return this.actions.size
  }
}
