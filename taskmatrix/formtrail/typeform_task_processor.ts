import type { TaskFormInput } from "./task_form_schemas"
import { TaskFormSchema } from "./task_form_schemas"
import { ExecutionEngine } from "./execution_engine"

/**
 * Processes a Typeform webhook payload to schedule a new task.
 */
export async function handleTypeformSubmission(
  raw: unknown
): Promise<{ success: boolean; message: string }> {
  const parsed = TaskFormSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      message: `Validation error: ${parsed.error.issues
        .map(i => i.message)
        .join("; ")}`,
    }
  }

  const { taskName, taskType, parameters, scheduleCron } = parsed.data as TaskFormInput

  // For now, just enqueue task into engine
  const engine = new ExecutionEngine()
  try {
    engine.register(taskType, async (params) => {
      return { executed: true, params }
    })
    engine.enqueue(taskName, taskType, parameters)
  } catch (err: any) {
    return { success: false, message: `Failed to schedule task: ${err.message}` }
  }

  return {
    success: true,
    message: `Task "${taskName}" of type "${taskType}" scheduled successfully`,
  }
}
