import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Activity,
  HardDrive,
  Lock,
  Gamepad2,
  RefreshCw,
  Cpu,
  Wifi,
  Wrench,
  FileCode,
  Download,
  AlertCircle
} from 'lucide-react';
import { HardwareStats, TweakItem, PresetProfile } from '../types/optimizer';
import { MetricCard } from '../components/MetricCard';
import { PresetSelector } from '../components/PresetSelector';
import { TweakCard } from '../components/TweakCard';
import { 
  flushDns, 
  flushRam, 
  runSsdTrim, 
  restartExplorer, 
  createGodMode, 
  setDnsProvider, 
  exportPortableScript 
} from '../utils/api';

interface DashboardViewProps {
  stats: HardwareStats | null;
  tweaks: TweakItem[];
  presets: PresetProfile[];
  onToggleTweak: (id: string, enable: boolean) => void;
  onRevertTweak: (id: string) => void;
  onInspectScript: (tweak: TweakItem) => void;
  onApplyPreset: (presetId: string) => void;
  onOpenRestoreModal: () => void;
  onNavigateCategory: (cat: any) => void;
  isProcessing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  tweaks,
  presets,
  onToggleTweak,
  onRevertTweak,
  onInspectScript,
  onApplyPreset,
  onOpenRestoreModal,
  onNavigateCategory,
  isProcessing
}) => {
  const [maintenanceStatus, setMaintenanceStatus] = useState<string | null>(null);
  const [selectedDns, setSelectedDns] = useState<string>('cloudflare');
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState(false);

  const activeCount = tweaks.filter(t => t.enabled).length;
  const totalCount = tweaks.length;
  const healthScore = Math.min(100, Math.round(55 + (activeCount / (totalCount || 1)) * 45));

  // Quick recommended tweaks
  const quickTweaks = tweaks.slice(0, 4);

  const handleMaintenanceAction = async (actionName: string, actionFn: () => Promise<any>) => {
    setIsMaintenanceRunning(true);
    setMaintenanceStatus(`Executing ${actionName}...`);
    try {
      const res = await actionFn();
      setMaintenanceStatus(res.message || `${actionName} completed successfully!`);
    } catch (err: any) {
      setMaintenanceStatus(`Error: ${err.message}`);
    } finally {
      setIsMaintenanceRunning(false);
    }
  };

  const handleSetDns = async (provider: string) => {
    setSelectedDns(provider);
    await handleMaintenanceAction(`DNS Provider -> ${provider.toUpperCase()}`, () => setDnsProvider(provider));
  };

  const handleExportScript = async () => {
    const activeIds = tweaks.filter(t => t.enabled).map(t => t.id);
    await handleMaintenanceAction('Export Portable Script (.ps1) to Desktop', () => exportPortableScript(activeIds.length ? activeIds : undefined));
  };

  return (
    <div>
      {/* Real-time Hardware Metrics */}
      <MetricCard stats={stats} />

      {/* System Health & Status Banner */}
      <div 
        className="fluent-card" 
        style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.15) 0%, rgba(135, 100, 184, 0.1) 100%)',
          borderColor: 'rgba(0, 120, 212, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div 
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'conic-gradient(#34d399 0%, #38bdf8 80%, rgba(255,255,255,0.1) 80%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.3)'
            }}
          >
            <div 
              style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '50%', 
                background: 'var(--bg-app)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
                color: 'var(--text-primary)'
              }}
            >
              {healthScore}%
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Optimization & Hardening Score</span>
              <span className="badge-risk safe" style={{ fontSize: '10px' }}>Active</span>
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              {activeCount} of {totalCount} optimizations active. System safeguards enabled.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={onOpenRestoreModal}>
            <ShieldCheck size={15} color="#34d399" />
            <span>Create Restore Point</span>
          </button>
          <button className="btn btn-primary" onClick={() => onApplyPreset('preset_balanced_safe')}>
            <Sparkles size={15} />
            <span>Quick Boost (Safe)</span>
          </button>
        </div>
      </div>

      {/* Maintenance Status Toast */}
      {maintenanceStatus && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--status-safe-bg)',
          border: '1px solid var(--status-safe-border)',
          color: '#34d399',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px'
        }}>
          <CheckCircle2 size={16} />
          <span>{maintenanceStatus}</span>
        </div>
      )}

      {/* 1-Click Quick Maintenance Suite */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              1-Click Instant Maintenance Suite
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Fast system hygiene tools that resolve memory leaks, network cache stutters, and storage fragmentation.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Flush RAM */}
          <div className="fluent-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Cpu size={16} color="#c084fc" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Flush Standby RAM</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Compact process working sets to instantly release idle memory.
              </p>
            </div>
            <button 
              className="btn btn-sm" 
              disabled={isMaintenanceRunning}
              onClick={() => handleMaintenanceAction('Flush Standby RAM', flushRam)}
            >
              <span>Purge Standby RAM</span>
            </button>
          </div>

          {/* Flush DNS */}
          <div className="fluent-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Wifi size={16} color="#38bdf8" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Flush DNS Resolver</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Clears stale DNS IP cache & fixes network socket routing.
              </p>
            </div>
            <button 
              className="btn btn-sm" 
              disabled={isMaintenanceRunning}
              onClick={() => handleMaintenanceAction('Flush DNS Resolver', flushDns)}
            >
              <span>Flush DNS Cache</span>
            </button>
          </div>

          {/* Force SSD TRIM */}
          <div className="fluent-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <HardDrive size={16} color="#34d399" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Force SSD TRIM</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Re-indexes NAND flash blocks to restore max SSD write speeds.
              </p>
            </div>
            <button 
              className="btn btn-sm" 
              disabled={isMaintenanceRunning}
              onClick={() => handleMaintenanceAction('SSD TRIM', runSsdTrim)}
            >
              <span>ReTrim Drive C:</span>
            </button>
          </div>

          {/* Restart Explorer */}
          <div className="fluent-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <RefreshCw size={16} color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Restart Explorer</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Instantly refreshes the taskbar and UI without rebooting.
              </p>
            </div>
            <button 
              className="btn btn-sm" 
              disabled={isMaintenanceRunning}
              onClick={() => handleMaintenanceAction('Restart Explorer', restartExplorer)}
            >
              <span>Restart Shell</span>
            </button>
          </div>

          {/* God Mode Shortcut */}
          <div className="fluent-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Wrench size={16} color="#00b7c3" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Create "God Mode"</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Places the master all-in-one control panel folder on Desktop.
              </p>
            </div>
            <button 
              className="btn btn-sm" 
              disabled={isMaintenanceRunning}
              onClick={() => handleMaintenanceAction('Create God Mode', createGodMode)}
            >
              <span>Add to Desktop</span>
            </button>
          </div>

          {/* Export Portable Script */}
          <div className="fluent-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Download size={16} color="#38bdf8" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Export .PS1 Script</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Export your configuration into a standalone script for any PC.
              </p>
            </div>
            <button 
              className="btn btn-sm" 
              disabled={isMaintenanceRunning}
              onClick={handleExportScript}
            >
              <span>Save .PS1 to Desktop</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Secure DNS Switcher */}
      <div className="fluent-card" style={{ marginBottom: '28px', padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={17} color="#00b7c3" />
              <span>1-Click Fast Secure DNS Optimizer</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Switch to low-latency, privacy-respecting DNS resolvers with built-in malware & phishing protection.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${selectedDns === 'cloudflare' ? 'btn-primary' : ''}`}
              onClick={() => handleSetDns('cloudflare')}
            >
              <span>Cloudflare (1.1.1.1 - Fastest)</span>
            </button>
            <button 
              className={`btn btn-sm ${selectedDns === 'quad9' ? 'btn-primary' : ''}`}
              onClick={() => handleSetDns('quad9')}
            >
              <span>Quad9 (9.9.9.9 - Malware Shield)</span>
            </button>
            <button 
              className={`btn btn-sm ${selectedDns === 'google' ? 'btn-primary' : ''}`}
              onClick={() => handleSetDns('google')}
            >
              <span>Google (8.8.8.8)</span>
            </button>
            <button 
              className={`btn btn-sm ${selectedDns === 'dhcp' ? 'btn-primary' : ''}`}
              onClick={() => handleSetDns('dhcp')}
            >
              <span>Default DHCP (ISP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Presets */}
      <PresetSelector 
        presets={presets}
        onApplyPreset={onApplyPreset}
        isProcessing={isProcessing}
      />

      {/* Feature Modules Shortcuts */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Optimization Modules
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="fluent-card" onClick={() => onNavigateCategory('performance')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(0, 120, 212, 0.15)', borderRadius: '8px', color: '#38bdf8' }}>
                <Zap size={18} />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Performance</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Power plans, GPU scheduling, startup manager.</p>
          </div>

          <div className="fluent-card" onClick={() => onNavigateCategory('debloat')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#f87171' }}>
                <Activity size={18} />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Debloater</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Uninstall UWP bloat & restore classic context menu.</p>
          </div>

          <div className="fluent-card" onClick={() => onNavigateCategory('privacy')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(0, 183, 195, 0.15)', borderRadius: '8px', color: '#00b7c3' }}>
                <Lock size={18} />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Privacy & AI</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Shut down telemetry, Copilot, & activity feeds.</p>
          </div>

          <div className="fluent-card" onClick={() => onNavigateCategory('gaming')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '6px', background: 'rgba(135, 100, 184, 0.15)', borderRadius: '8px', color: '#c084fc' }}>
                <Gamepad2 size={18} />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Gaming</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>MMCSS low-latency scheduler & DVR buffer off.</p>
          </div>
        </div>
      </div>

      {/* Featured Quick Tweaks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recommended Quick Toggles
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Safe for all Windows 11 PCs</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {quickTweaks.map((tweak) => (
            <TweakCard
              key={tweak.id}
              tweak={tweak}
              onToggle={onToggleTweak}
              onRevert={onRevertTweak}
              onInspectScript={onInspectScript}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
