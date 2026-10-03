import { HardwareStats, TweakItem, PresetProfile, RestorePointItem, SystemSnapshot, CleanTarget, StartupItem, UwpPackage, LogEntry } from '../types/optimizer';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchHardwareStats(): Promise<HardwareStats> {
  const res = await fetch(`${API_BASE}/system/stats`);
  return res.json();
}

export async function fetchTweaks(): Promise<{ tweaks: TweakItem[]; presets: PresetProfile[] }> {
  const res = await fetch(`${API_BASE}/tweaks`);
  return res.json();
}

export async function toggleTweak(tweakId: string, enable: boolean, dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/tweaks/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tweakId, enable, dryRun })
  });
  return res.json();
}

export async function revertTweak(tweakId: string, dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/tweaks/revert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tweakId, dryRun })
  });
  return res.json();
}

export async function applyPreset(presetId: string, dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/tweaks/apply-preset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ presetId, dryRun })
  });
  return res.json();
}

export async function revertAllTweaks(dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/tweaks/revert-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dryRun })
  });
  return res.json();
}

export async function fetchRestorePoints(): Promise<RestorePointItem[]> {
  const res = await fetch(`${API_BASE}/restore-points`);
  return res.json();
}

export async function createRestorePoint(description: string): Promise<{ success: boolean; message: string; requiresAdmin?: boolean }> {
  const res = await fetch(`${API_BASE}/restore-points/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  return res.json();
}

export async function enableSystemProtection(): Promise<{ success: boolean; message: string; requiresElevation?: boolean }> {
  const res = await fetch(`${API_BASE}/restore-points/enable-system-protection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function fetchSnapshots(): Promise<SystemSnapshot[]> {
  const res = await fetch(`${API_BASE}/snapshots`);
  return res.json();
}

export async function saveSnapshot(name: string): Promise<SystemSnapshot> {
  const res = await fetch(`${API_BASE}/snapshots/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function rollbackSnapshot(snapshotId: string, dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/snapshots/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshotId, dryRun })
  });
  return res.json();
}

export async function fetchCleanTargets(): Promise<CleanTarget[]> {
  const res = await fetch(`${API_BASE}/cleaner/targets`);
  return res.json();
}

export async function runClean(targetIds: string[], dryRun: boolean = false): Promise<{ freedBytes: number; formattedFreed: string }> {
  const res = await fetch(`${API_BASE}/cleaner/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetIds, dryRun })
  });
  return res.json();
}

export async function fetchStartupItems(): Promise<StartupItem[]> {
  const res = await fetch(`${API_BASE}/startup/items`);
  return res.json();
}

export async function toggleStartupItem(id: string, name: string, enable: boolean, dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/startup/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, enable, dryRun })
  });
  return res.json();
}

export async function fetchUwpPackages(): Promise<UwpPackage[]> {
  const res = await fetch(`${API_BASE}/uwp/packages`);
  return res.json();
}

export async function uninstallUwp(packageNames: string[], dryRun: boolean = false): Promise<{ successCount: number }> {
  const res = await fetch(`${API_BASE}/uwp/uninstall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageNames, dryRun })
  });
  return res.json();
}

export async function flushDns(dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/flush-dns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dryRun })
  });
  return res.json();
}

export async function flushRam(dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/flush-ram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dryRun })
  });
  return res.json();
}

export async function runSsdTrim(dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/ssd-trim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dryRun })
  });
  return res.json();
}

export async function restartExplorer(dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/restart-explorer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dryRun })
  });
  return res.json();
}

export async function createGodMode(dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/god-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dryRun })
  });
  return res.json();
}

export async function setDnsProvider(provider: string, dryRun: boolean = false): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/set-dns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, dryRun })
  });
  return res.json();
}

export async function exportPortableScript(tweakIds?: string[]): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/export-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tweakIds })
  });
  return res.json();
}

export async function fetchLogs(): Promise<LogEntry[]> {
  const res = await fetch(`${API_BASE}/logs`);
  return res.json();
}

export async function clearLogs(): Promise<any> {
  const res = await fetch(`${API_BASE}/logs`, { method: 'DELETE' });
  return res.json();
}
