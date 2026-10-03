import { exec, spawn } from 'child_process';
import { LogEntry } from '../src/types/optimizer';

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  dryRun?: boolean;
}

let logHistory: LogEntry[] = [];

export function getLogs(): LogEntry[] {
  return [...logHistory];
}

export function addLog(level: 'info' | 'success' | 'warning' | 'error', message: string, command?: string, output?: string): LogEntry {
  const entry: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
    command,
    output
  };
  logHistory.unshift(entry);
  if (logHistory.length > 300) {
    logHistory = logHistory.slice(0, 300);
  }
  return entry;
}

export function clearLogs(): void {
  logHistory = [];
}

export async function checkIsAdmin(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('powershell -NoProfile -Command "([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)"', (error, stdout) => {
      if (error) {
        resolve(false);
        return;
      }
      resolve(stdout.trim().toLowerCase() === 'true');
    });
  });
}

export async function executePowerShell(
  command: string, 
  dryRun: boolean = false
): Promise<ExecutionResult> {
  const startTime = Date.now();

  if (dryRun) {
    addLog('info', `[DRY-RUN] Script simulated (no changes written to disk)`, command);
    return {
      success: true,
      stdout: `[DRY-RUN SIMULATION]\nCommand evaluated successfully:\n${command}`,
      stderr: '',
      durationMs: Date.now() - startTime,
      dryRun: true
    };
  }

  return new Promise((resolve) => {
    // Wrap command in utf-8 powershell execution with bypass execution policy
    const encodedCommand = Buffer.from(command, 'utf16le').toString('base64');
    const psProcess = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-EncodedCommand', encodedCommand
    ], {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    psProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    psProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    psProcess.on('close', (code) => {
      const durationMs = Date.now() - startTime;
      const success = code === 0;

      if (success) {
        addLog('success', `PowerShell command executed successfully (${durationMs}ms)`, command, stdout.trim());
      } else {
        addLog('error', `Command failed with exit code ${code}`, command, stderr.trim() || stdout.trim());
      }

      resolve({
        success,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        durationMs,
        dryRun: false
      });
    });

    psProcess.on('error', (err) => {
      const durationMs = Date.now() - startTime;
      addLog('error', `Process execution error: ${err.message}`, command);
      resolve({
        success: false,
        stdout: '',
        stderr: err.message,
        durationMs,
        dryRun: false
      });
    });
  });
}
