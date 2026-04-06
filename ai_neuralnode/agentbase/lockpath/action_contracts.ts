import { z } from "zod"

/**
 * Base types for any flow action.
 */
export type ActionSchema = z.ZodObject<z.ZodRawShape>

export interface ActionResponse<T> {
  notice: string
  data?: T
  error?: string
  timestamp?: number
}

export interface BaseAction<S extends ActionSchema, R, Ctx = unknown> {
  id: string
  summary: string
  input: S
  tags?: string[]
  category?: string

  validate(payload: unknown): { success: boolean; errors?: string[] } {
    try {
      this.input.parse(payload)
      return { success: true }
    } catch (err: any) {
      const issues = err.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`) ?? []
      return { success: false, errors: issues }
    }
  }

  execute(args: {
    payload: z.infer<S>
    context: Ctx
  }): Promise<ActionResponse<R>>
}

export abstract class AbstractAction<S extends ActionSchema, R, Ctx = unknown>
  implements BaseAction<S, R, Ctx>
{
  abstract id: string
  abstract summary: string
  abstract input: S
  tags?: string[]
  category?: string

  abstract execute(args: {
    payload: z.infer<S>
    context: Ctx
  }): Promise<ActionResponse<R>>

  validate(payload: unknown): { success: boolean; errors?: string[] } {
    try {
      this.input.parse(payload)
      return { success: true }
    } catch (err: any) {
      const issues = err.errors?.map((e: any) => `${e.path.join(".")}: ${e.message}`) ?? []
      return { success: false, errors: issues }
    }
  }

  protected buildResponse(
    notice: string,
    data?: R,
    error?: string
  ): ActionResponse<R> {
    return {
      notice,
      data,
      error,
      timestamp: Date.now(),
    }
  }
}
