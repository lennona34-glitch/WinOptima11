import React, { useState, useEffect } from 'react';
import { CategoryType, HardwareStats, TweakItem, PresetProfile, RestorePointItem, SystemSnapshot, LogEntry } from './types/optimizer';
import { 
  fetchHardwareStats, 
  fetchTweaks, 
  toggleTweak, 
  revertTweak, 
  applyPreset, 
  revertAllTweaks, 
  fetchRestorePoints, 
  createRestorePoint, 
  fetchSnapshots, 
  saveSnapshot, 
  rollbackSnapshot, 
  fetchLogs, 
  clearLogs 
} from './utils/api';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { LogConsole } from './components/LogConsole';
import { RestoreModal } from './components/RestoreModal';
import { ScriptModal } from './components/ScriptModal';

// Views
import { DashboardView } from './views/DashboardView';
import { SafeguardsView } from './views/SafeguardsView';
import { PerformanceView } from './views/PerformanceView';
import { DebloatView } from './views/DebloatView';
import { PrivacyView } from './views/PrivacyView';
import { GamingView } from './views/GamingView';
import { CleanerView } from './views/CleanerView';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('dashboard');
  const [stats, setStats] = useState<HardwareStats | null>(null);
  const [tweaks, setTweaks] = useState<TweakItem[]>([]);
  const [presets, setPresets] = useState<PresetProfile[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePointItem[]>([]);
  const [snapshots, setSnapshots] = useState<SystemSnapshot[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // UI states
  const [dryRun, setDryRun] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [isLogConsoleOpen, setIsLogConsoleOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [inspectedTweak, setInspectedTweak] = useState<TweakItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize data
  useEffect(() => {
    // Initial fetch
    fetchHardwareStats().then(setStats).catch(console.error);
    fetchTweaks().then(data => {
      setTweaks(data.tweaks);
      setPresets(data.presets);
    }).catch(console.error);
    fetchRestorePoints().then(setRestorePoints).catch(console.error);
    fetchSnapshots().then(setSnapshots).catch(console.error);
    fetchLogs().then(setLogs).catch(console.error);

    // Setup WebSocket connection for live telemetry & logs
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'TELEMETRY_UPDATE') {
            setStats(message.data);
          }
        } catch (err) {
          // ignore
        }
      };
    } catch (e) {
      console.warn('WebSocket connection not ready, polling fallback');
    }

    // Refresh logs periodically
    const logInterval = setInterval(() => {
      fetchLogs().then(setLogs).catch(() => {});
    }, 3000);

    return () => {
      if (ws) ws.close();
      clearInterval(logInterval);
    };
  }, []);

  // Theme switch effect
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  // Handlers
  const handleToggleTweak = async (tweakId: string, enable: boolean) => {
    setIsProcessing(true);
    // Optimistic UI update
    setTweaks(prev => prev.map(t => t.id === tweakId ? { ...t, enabled: enable } : t));
    try {
      const res = await toggleTweak(tweakId, enable, dryRun);
      if (res.enabled !== undefined) {
        setTweaks(prev => prev.map(t => t.id === tweakId ? { ...t, enabled: res.enabled } : t));
      }
      fetchLogs().then(setLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevertTweak = async (tweakId: string) => {
    setIsProcessing(true);
    try {
      await revertTweak(tweakId, dryRun);
      setTweaks(prev => prev.map(t => t.id === tweakId ? { ...t, enabled: false } : t));
      fetchLogs().then(setLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    setIsProcessing(true);
    try {
      await applyPreset(presetId, dryRun);
      const data = await fetchTweaks();
      setTweaks(data.tweaks);
      fetchLogs().then(setLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevertAll = async () => {
    if (window.confirm('Reset all modified settings and services back to standard Windows 11 defaults?')) {
      setIsProcessing(true);
      try {
        await revertAllTweaks(dryRun);
        setTweaks(prev => prev.map(t => ({ ...t, enabled: false })));
        fetchLogs().then(setLogs);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCreateRestorePoint = async (description: string) => {
    const res = await createRestorePoint(description);
    fetchRestorePoints().then(setRestorePoints);
    fetchLogs().then(setLogs);
    return res;
  };

  const handleSaveSnapshot = async (name: string) => {
    const res = await saveSnapshot(name);
    fetchSnapshots().then(setSnapshots);
    fetchLogs().then(setLogs);
    return res;
  };

  const handleRollbackSnapshot = async (snapshotId: string) => {
    setIsProcessing(true);
    try {
      await rollbackSnapshot(snapshotId, dryRun);
      const data = await fetchTweaks();
      setTweaks(data.tweaks);
      fetchLogs().then(setLogs);
      setIsRestoreModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearLogs = async () => {
    await clearLogs();
    setLogs([]);
  };

  const activeTweaksCount = tweaks.filter(t => t.enabled).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Navigation
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        activeTweaksCount={activeTweaksCount}
        isLogConsoleOpen={isLogConsoleOpen}
        onToggleLogConsole={() => setIsLogConsoleOpen(!isLogConsoleOpen)}
        isAdmin={stats?.isAdmin || false}
      />

      {/* Main App Workspace */}
      <main className="main-content">
        <Header
          activeCategory={activeCategory}
          dryRun={dryRun}
          onToggleDryRun={() => setDryRun(!dryRun)}
          isLightTheme={isLightTheme}
          onToggleTheme={() => setIsLightTheme(!isLightTheme)}
          onOpenRestoreModal={() => setIsRestoreModalOpen(true)}
          onRevertAll={handleRevertAll}
          isAdmin={stats?.isAdmin || false}
        />

        {/* View Viewport */}
        <div className="view-viewport">
          {activeCategory === 'dashboard' && (
            <DashboardView
              stats={stats}
              tweaks={tweaks}
              presets={presets}
              onToggleTweak={handleToggleTweak}
              onRevertTweak={handleRevertTweak}
              onInspectScript={setInspectedTweak}
              onApplyPreset={handleApplyPreset}
              onOpenRestoreModal={() => setIsRestoreModalOpen(true)}
              onNavigateCategory={setActiveCategory}
              isProcessing={isProcessing}
            />
          )}

          {activeCategory === 'safeguards' && (
            <SafeguardsView
              restorePoints={restorePoints}
              snapshots={snapshots}
              onCreateRestorePoint={handleCreateRestorePoint}
              onSaveSnapshot={handleSaveSnapshot}
              onRollbackSnapshot={handleRollbackSnapshot}
              onRevertAll={handleRevertAll}
              dryRun={dryRun}
            />
          )}

          {activeCategory === 'performance' && (
            <PerformanceView
              tweaks={tweaks}
              onToggleTweak={handleToggleTweak}
              onRevertTweak={handleRevertTweak}
              onInspectScript={setInspectedTweak}
              dryRun={dryRun}
              isProcessing={isProcessing}
            />
          )}

          {activeCategory === 'debloat' && (
            <DebloatView
              tweaks={tweaks}
              onToggleTweak={handleToggleTweak}
              onRevertTweak={handleRevertTweak}
              onInspectScript={setInspectedTweak}
              dryRun={dryRun}
              isProcessing={isProcessing}
            />
          )}

          {activeCategory === 'privacy' && (
            <PrivacyView
              tweaks={tweaks}
              onToggleTweak={handleToggleTweak}
              onRevertTweak={handleRevertTweak}
              onInspectScript={setInspectedTweak}
              isProcessing={isProcessing}
            />
          )}

          {activeCategory === 'gaming' && (
            <GamingView
              tweaks={tweaks}
              onToggleTweak={handleToggleTweak}
              onRevertTweak={handleRevertTweak}
              onInspectScript={setInspectedTweak}
              isProcessing={isProcessing}
            />
          )}

          {activeCategory === 'cleaner' && (
            <CleanerView dryRun={dryRun} />
          )}
        </div>

        {/* Live Logs Terminal Drawer */}
        <LogConsole
          isOpen={isLogConsoleOpen}
          onToggle={() => setIsLogConsoleOpen(!isLogConsoleOpen)}
          logs={logs}
          onClearLogs={handleClearLogs}
        />
      </main>

      {/* Restore Points & Snapshot Modal */}
      <RestoreModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        restorePoints={restorePoints}
        snapshots={snapshots}
        onCreateRestorePoint={handleCreateRestorePoint}
        onSaveSnapshot={handleSaveSnapshot}
        onRollbackSnapshot={handleRollbackSnapshot}
      />

      {/* PowerShell & Registry Script Inspector Modal */}
      <ScriptModal
        tweak={inspectedTweak}
        isOpen={!!inspectedTweak}
        onClose={() => setInspectedTweak(null)}
      />
    </div>
  );
};
