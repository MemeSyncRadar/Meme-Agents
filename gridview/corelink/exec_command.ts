import { exec } from "child_process"

/**
 * Execute a shell command and return stdout or throw on error.
 * @param command Shell command to run (e.g., "ls -la")
 * @param timeoutMs Optional timeout in milliseconds
 */
export function execCommand(command: string, timeoutMs: number = 30_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Command failed: ${stderr || error.message}`))
      }
      resolve(stdout.trim())
    })

    // capture errors from the process itself
    proc.on("error", err => {
      reject(new Error(`Process error: ${err.message}`))
    })
  })
}

/**
 * Execute a shell command with both stdout and stderr returned separately.
 * Useful when caller needs raw outputs without merging.
 */
export function execCommandWithOutput(
  command: string,
  timeoutMs: number = 30_000
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Command failed: ${stderr || error.message}`))
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() })
    })
  })
}

/**
 * Check if a command exists in the environment.
 */
export async function commandExists(command: string): Promise<boolean> {
  try {
    const whichCmd = process.platform === "win32" ? `where ${command}` : `which ${command}`
    await execCommand(whichCmd, 10_000)
    return true
  } catch {
    return false
  }
}
