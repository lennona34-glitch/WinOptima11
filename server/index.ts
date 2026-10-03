import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { TWEAKS_DATABASE, OPTIMIZER_PRESETS } from './optimizer-registry';
import { getHardwareStats } from './system-info';
import { executePowerShell, getLogs, clearLogs, addLog } from './executor';
import { createSystemRestorePoint, getSystemRestorePoints, saveStateSnapshot, listStateSnapshots } from './restore-point';
import { scanCleanTargets, executeCleanTargets } from './cleaner';
import { getStartupItems, toggleStartupItem } from './startup-manager';
import { getInstalledUwpBloatware, uninstallUwpPackages } from './uwp-manager';

const app = express();
const PORT = process.env.PORT || 3660;

app.use(cors());
app.use(express.json());

// In-memory state of active tweaks (synced with registry / runtime)
let activeTweaksState: Record<string, boolean> = {};

// Initialize state
TWEAKS_DATABASE.forEach(t => {
  activeTweaksState[t.id] = false;
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Broadcast live telemetry
setInterval(async () => {
  if (wss.clients.size > 0) {
    try {
      const stats = await getHardwareStats();
      const payload = JSON.stringify({ type: 'TELEMETRY_UPDATE', data: stats });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    } catch (e) {
      // ignore
    }
  }
}, 2000);

wss.on('connection', (ws) => {
  addLog('info', 'Client connected to real-time telemetry stream');
  // Send initial stats
  getHardwareStats().then(stats => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'TELEMETRY_UPDATE', data: stats }));
    }
  });
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/system/stats', async (req, res) => {
  try {
    const stats = await getHardwareStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tweaks', (req, res) => {
  const tweaksWithState = TWEAKS_DATABASE.map(t => ({
    ...t,
    enabled: !!activeTweaksState[t.id]
  }));
  res.json({
    tweaks: tweaksWithState,
    presets: OPTIMIZER_PRESETS
  });
});

app.post('/api/tweaks/toggle', async (req, res) => {
  const { tweakId, enable, dryRun } = req.body;
  const tweak = TWEAKS_DATABASE.find(t => t.id === tweakId);

  if (!tweak) {
    return res.status(404).json({ error: 'Tweak not found' });
  }

  const scriptToRun = enable ? tweak.powershellEnable : tweak.powershellDisable;
  const result = await executePowerShell(scriptToRun, dryRun);

  if (result.success || dryRun) {
    activeTweaksState[tweakId] = !!enable;
  }

  res.json({
    success: result.success,
    tweakId,
    enabled: activeTweaksState[tweakId],
    result
  });
});

app.post('/api/tweaks/revert', async (req, res) => {
  const { tweakId, dryRun } = req.body;
  const tweak = TWEAKS_DATABASE.find(t => t.id === tweakId);

  if (!tweak) {
    return res.status(404).json({ error: 'Tweak not found' });
  }

  addLog('info', `Reverting tweak "${tweak.name}" to factory default...`);
  const result = await executePowerShell(tweak.revertToDefault, dryRun);

  if (result.success || dryRun) {
    activeTweaksState[tweakId] = false;
  }

  res.json({
    success: result.success,
    tweakId,
    enabled: false,
    result
  });
});

app.post('/api/tweaks/apply-preset', async (req, res) => {
  const { presetId, dryRun } = req.body;
  const preset = OPTIMIZER_PRESETS.find(p => p.id === presetId);

  if (!preset) {
    return res.status(404).json({ error: 'Preset profile not found' });
  }

  addLog('info', `Applying optimization profile: ${preset.name} (${preset.tweakIds.length} tweaks)`);

  const results: any[] = [];
  for (const tweakId of preset.tweakIds) {
    const tweak = TWEAKS_DATABASE.find(t => t.id === tweakId);
    if (tweak) {
      const res = await executePowerShell(tweak.powershellEnable, dryRun);
      if (res.success || dryRun) {
        activeTweaksState[tweakId] = true;
      }
      results.push({ tweakId, success: res.success });
    }
  }

  res.json({
    success: true,
    presetId,
    appliedCount: results.filter(r => r.success).length,
    results
  });
});

app.post('/api/tweaks/revert-all', async (req, res) => {
  const { dryRun } = req.body;
  addLog('warning', 'Initiating 1-Click Rollback: Resetting all settings to Windows Defaults...');

  const results: any[] = [];
  for (const tweak of TWEAKS_DATABASE) {
    if (activeTweaksState[tweak.id]) {
      const res = await executePowerShell(tweak.revertToDefault, dryRun);
      if (res.success || dryRun) {
        activeTweaksState[tweak.id] = false;
      }
      results.push({ tweakId: tweak.id, success: res.success });
    }
  }

  res.json({
    success: true,
    revertedCount: results.length
  });
});

// Safeguards & Restore Points
app.get('/api/restore-points', async (req, res) => {
  const points = await getSystemRestorePoints();
  res.json(points);
});

app.post('/api/restore-points/create', async (req, res) => {
  const { description } = req.body;
  const result = await createSystemRestorePoint(description || 'WinOptima 11 Safeguard Checkpoint');
  res.json(result);
});

app.post('/api/restore-points/enable-system-protection', async (req, res) => {
  const { enableSystemProtection } = await import('./restore-point');
  const result = await enableSystemProtection();
  res.json(result);
});

app.get('/api/snapshots', (req, res) => {
  res.json(listStateSnapshots());
});

app.post('/api/snapshots/save', (req, res) => {
  const { name } = req.body;
  const snap = saveStateSnapshot(name || `Snapshot ${new Date().toLocaleTimeString()}`, activeTweaksState);
  res.json(snap);
});

app.post('/api/snapshots/rollback', async (req, res) => {
  const { snapshotId, dryRun } = req.body;
  const snapshots = listStateSnapshots();
  const snap = snapshots.find(s => s.id === snapshotId);

  if (!snap) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }

  addLog('info', `Rolling back to snapshot "${snap.name}"...`);

  for (const tweak of TWEAKS_DATABASE) {
    const targetState = !!snap.tweakStates[tweak.id];
    const currentState = !!activeTweaksState[tweak.id];

    if (targetState !== currentState) {
      const cmd = targetState ? tweak.powershellEnable : tweak.powershellDisable;
      await executePowerShell(cmd, dryRun);
      activeTweaksState[tweak.id] = targetState;
    }
  }

  res.json({ success: true, message: `Rolled back to ${snap.name}` });
});

// Storage Cleaner
app.get('/api/cleaner/targets', async (req, res) => {
  const targets = await scanCleanTargets();
  res.json(targets);
});

app.post('/api/cleaner/clean', async (req, res) => {
  const { targetIds, dryRun } = req.body;
  const result = await executeCleanTargets(targetIds || [], dryRun);
  res.json(result);
});

// Startup Apps
app.get('/api/startup/items', async (req, res) => {
  const items = await getStartupItems();
  res.json(items);
});

app.post('/api/startup/toggle', async (req, res) => {
  const { id, name, enable, dryRun } = req.body;
  const success = await toggleStartupItem(id, name, enable, dryRun);
  res.json({ success, id, enabled: enable });
});

// UWP Bloatware
app.get('/api/uwp/packages', async (req, res) => {
  const packages = await getInstalledUwpBloatware();
  res.json(packages);
});

app.post('/api/uwp/uninstall', async (req, res) => {
  const { packageNames, dryRun } = req.body;
  const result = await uninstallUwpPackages(packageNames || [], dryRun);
  res.json(result);
});

// Quick Maintenance Endpoints
app.post('/api/maintenance/flush-dns', async (req, res) => {
  const { flushDnsCache } = await import('./quick-maintenance');
  const result = await flushDnsCache(req.body.dryRun);
  res.json(result);
});

app.post('/api/maintenance/flush-ram', async (req, res) => {
  const { flushStandbyMemory } = await import('./quick-maintenance');
  const result = await flushStandbyMemory(req.body.dryRun);
  res.json(result);
});

app.post('/api/maintenance/ssd-trim', async (req, res) => {
  const { forceSsdTrim } = await import('./quick-maintenance');
  const result = await forceSsdTrim(req.body.dryRun);
  res.json(result);
});

app.post('/api/maintenance/restart-explorer', async (req, res) => {
  const { restartExplorer } = await import('./quick-maintenance');
  const result = await restartExplorer(req.body.dryRun);
  res.json(result);
});

app.post('/api/maintenance/god-mode', async (req, res) => {
  const { createGodModeShortcut } = await import('./quick-maintenance');
  const result = await createGodModeShortcut(req.body.dryRun);
  res.json(result);
});

app.post('/api/maintenance/set-dns', async (req, res) => {
  const { setDnsServers } = await import('./quick-maintenance');
  const result = await setDnsServers(req.body.provider, req.body.dryRun);
  res.json(result);
});

app.post('/api/maintenance/export-script', (req, res) => {
  const { exportPortableScript } = require('./quick-maintenance');
  const result = exportPortableScript(req.body.tweakIds || Object.keys(activeTweaksState).filter(k => activeTweaksState[k]));
  res.json(result);
});

// Logs
app.get('/api/logs', (req, res) => {
  res.json(getLogs());
});

app.delete('/api/logs', (req, res) => {
  clearLogs();
  res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`[WinOptima 11] Backend engine listening on http://localhost:${PORT}`);
  addLog('info', `WinOptima 11 core engine initialized on port ${PORT}`);
});
