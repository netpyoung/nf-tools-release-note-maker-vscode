import { exec } from 'child_process';
import * as util from 'util';

const execAsync = util.promisify(exec);

export async function runCommand(cmd: string, cwd?: string) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: cwd ?? undefined, windowsHide: true, });
    return {
      success: true,
      stdout,
      stderr
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout,
      stderr: error.stderr,
      error
    };
  }
}
