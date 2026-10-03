import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  FileJson,
  HelpCircle,
  Wrench,
  Zap
} from 'lucide-react';
import { RestorePointItem, SystemSnapshot } from '../types/optimizer';
import { enableSystemProtection } from '../utils/api';

interface SafeguardsViewProps {
  restorePoints: RestorePointItem[];
  snapshots: SystemSnapshot[];
  onCreateRestorePoint: (desc: string) => Promise<any>;
  onSaveSnapshot: (name: string) => Promise<any>;
  onRollbackSnapshot: (id: string) => Promise<any>;
  onRevertAll: () => void;
  dryRun: boolean;
}

export const SafeguardsView: React.FC<SafeguardsViewProps> = ({
  restorePoints,
  snapshots,
  onCreateRestorePoint,
  onSaveSnapshot,
  onRollbackSnapshot,
  onRevertAll,
  dryRun
}) => {
  const [desc, setDesc] = useState('WinOptima 11 Pre-Optimization Safeguard');
  const [snapName, setSnapName] = useState('System Configuration Baseline');
  const [isCreating, setIsCreating] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const handleCreatePoint = async () => {
    setIsCreating(true);
    setStatusMsg(null);
    try {
      const res = await onCreateRestorePoint(desc);
      if (res.success) {
        setStatusMsg({ text: 'Windows System Restore Point successfully generated!', type: 'success' });
      } else {
        setStatusMsg({ text: res.message || 'System Restore is blocked. Use the Fix button below or run as Admin.', type: 'warning' });
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message, type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFixProtection = async () => {
    setIsFixing(true);
    try {
      const res = await enableSystemProtection();
      setStatusMsg({ text: res.message, type: res.success ? 'success' : 'error' });
    } catch (e: any) {
      setStatusMsg({ text: e.message, type: 'error' });
    } finally {
      setIsFixing(false);
    }
  };

  const handleCreateSnapshot = async () => {
    setIsCreating(true);
    try {
      await onSaveSnapshot(snapName);
      setStatusMsg({ text: 'Configuration snapshot exported to .snapshots directory.', type: 'success' });
    } catch (e: any) {
      setStatusMsg({ text: e.message, type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      {/* Safeguard Assurance Banner */}
      <div 
        className="fluent-card" 
        style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(0, 120, 212, 0.1) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.25)', borderRadius: '12px', color: '#34d399' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Safety First: Automated Protection & Reversibility
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Every single optimization in WinOptima 11 is 100% reversible. We enforce strict safety thresholds and dual safeguards.
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleFixProtection} disabled={isFixing}>
          <Wrench size={15} />
          <span>{isFixing ? 'Unlocking...' : 'Fix & Unlock System Protection'}</span>
        </button>
      </div>

      {statusMsg && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          background: statusMsg.type === 'success' ? 'var(--status-safe-bg)' : statusMsg.type === 'warning' ? 'var(--status-adv-bg)' : 'var(--status-danger-bg)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--status-safe-border)' : statusMsg.type === 'warning' ? 'var(--status-adv-border)' : 'var(--status-danger-border)'}`,
          color: statusMsg.type === 'success' ? '#34d399' : statusMsg.type === 'warning' ? '#fbbf24' : '#f87171',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px'
        }}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Safety Classification Guide */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Safety Threshold Levels
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div className="fluent-card" style={{ borderLeft: '4px solid #10b981' }}>
            <span className="badge-risk safe" style={{ marginBottom: '6px' }}>Safe (Tier 1)</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Zero risk. Cleans cache, disables Start ads, and enables classic context menus. Recommended for every machine.</p>
          </div>

          <div className="fluent-card" style={{ borderLeft: '4px solid #0284c7' }}>
            <span className="badge-risk recommended" style={{ marginBottom: '6px' }}>Recommended (Tier 2)</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Significant performance & privacy boost with no side effects for 99% of normal users (e.g. DiagTrack off, Game DVR off).</p>
          </div>

          <div className="fluent-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span className="badge-risk advanced" style={{ marginBottom: '6px' }}>Advanced (Tier 3)</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Modifies system services or scheduler quantum. For power users and dedicated gaming rigs.</p>
          </div>

          <div className="fluent-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <span className="badge-risk danger" style={{ marginBottom: '6px' }}>Caution (Tier 4)</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deep structural alterations. Requires manual confirmation before execution.</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Create Restore Point */}
        <div className="fluent-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldCheck size={18} color="#34d399" />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Windows System Restore Checkpoint
            </h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Triggers Windows VSS (Volume Shadow Copy) to create a system checkpoint before modifications.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Checkpoint description..."
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button className="btn btn-primary" onClick={handleCreatePoint} disabled={isCreating}>
              <Plus size={14} />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* 1-Click Rollback */}
        <div className="fluent-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <RotateCcw size={18} color="#f87171" />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              1-Click Factory Default Rollback
            </h4>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Instantly reverts every single altered setting, service startup type, and registry key back to stock Windows 11 defaults.
          </p>
          <button className="btn btn-danger" onClick={onRevertAll} style={{ width: '100%', padding: '9px 14px' }}>
            <RotateCcw size={14} />
            <span>Reset All Tweaks to Windows Defaults</span>
          </button>
        </div>
      </div>

      {/* Restore Points History */}
      <div className="fluent-card" style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} />
          <span>System Restore Points & Snapshot History</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {restorePoints.map((point) => (
            <div 
              key={point.id}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                  {point.description}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Created on: {point.timestamp} {point.sequenceNumber && `(Seq #${point.sequenceNumber})`}
                </div>
              </div>
              <span className="badge-risk safe" style={{ fontSize: '10px' }}>Active Checkpoint</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
