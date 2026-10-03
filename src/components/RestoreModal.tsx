import React, { useState } from 'react';
import { ShieldCheck, Plus, X, RotateCcw, AlertCircle, CheckCircle2, History, Wrench, ShieldAlert, Zap } from 'lucide-react';
import { RestorePointItem, SystemSnapshot } from '../types/optimizer';
import { enableSystemProtection } from '../utils/api';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  restorePoints: RestorePointItem[];
  snapshots: SystemSnapshot[];
  onCreateRestorePoint: (description: string) => Promise<any>;
  onSaveSnapshot: (name: string) => Promise<any>;
  onRollbackSnapshot: (snapshotId: string) => Promise<any>;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({
  isOpen,
  onClose,
  restorePoints,
  snapshots,
  onCreateRestorePoint,
  onSaveSnapshot,
  onRollbackSnapshot
}) => {
  const [description, setDescription] = useState('WinOptima 11 Pre-Optimization Safeguard');
  const [snapshotName, setSnapshotName] = useState('My Custom State Backup');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning'; requiresAdmin?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleCreatePoint = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await onCreateRestorePoint(description);
      if (res.success) {
        setStatusMessage({ text: 'Windows System Restore Point created successfully!', type: 'success' });
      } else {
        setStatusMessage({ 
          text: res.message || 'System Restore creation is blocked. Click "Fix & Enable System Restore" or launch as Administrator.', 
          type: 'warning',
          requiresAdmin: res.requiresAdmin
        });
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFixSystemProtection = async () => {
    setIsFixing(true);
    try {
      const res = await enableSystemProtection();
      setStatusMessage({
        text: res.message,
        type: res.success ? 'success' : 'error'
      });
    } catch (e: any) {
      setStatusMessage({ text: e.message, type: 'error' });
    } finally {
      setIsFixing(false);
    }
  };

  const handleCreateSnapshot = async () => {
    setIsSubmitting(true);
    try {
      await onSaveSnapshot(snapshotName);
      setStatusMessage({ text: 'System configuration snapshot saved to JSON! 100% reversible anytime.', type: 'success' });
    } catch (e: any) {
      setStatusMessage({ text: e.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#34d399' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Safeguards & Restore Points
              </h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                Protect your Windows 11 installation with restore points and snapshots
              </p>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {statusMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: statusMessage.type === 'success' 
                ? 'var(--status-safe-bg)' 
                : statusMessage.type === 'warning'
                ? 'var(--status-adv-bg)'
                : 'var(--status-danger-bg)',
              border: `1px solid ${
                statusMessage.type === 'success' 
                  ? 'var(--status-safe-border)' 
                  : statusMessage.type === 'warning'
                  ? 'var(--status-adv-border)'
                  : 'var(--status-danger-border)'
              }`,
              color: statusMessage.type === 'success' ? '#34d399' : statusMessage.type === 'warning' ? '#fbbf24' : '#f87171',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12.5px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMessage.text}</span>
              </div>

              {statusMessage.requiresAdmin && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleFixSystemProtection} disabled={isFixing}>
                    <Wrench size={13} />
                    <span>{isFixing ? 'Unlocking...' : '1-Click Fix & Unlock System Restore'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick System Restore Checkpoint Box */}
          <div className="fluent-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Create Windows System Restore Checkpoint
              </h4>
              <button 
                className="btn btn-sm" 
                onClick={handleFixSystemProtection}
                disabled={isFixing}
                title="Enables System Protection on C:, starts VSS, and removes 24h frequency limit"
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                <Wrench size={12} color="#38bdf8" />
                <span>Fix / Unlock System Protection</span>
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Invokes Windows Volume Shadow Copy (VSS) to snapshot registry and system files before optimization.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Checkpoint description..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button 
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={handleCreatePoint}
              >
                <Plus size={15} />
                <span>Create Point</span>
              </button>
            </div>
          </div>

          {/* Instant JSON State Snapshot Backup (Works 100% in all modes) */}
          <div className="fluent-card" style={{ padding: '16px', background: 'rgba(0, 120, 212, 0.06)', borderColor: 'rgba(0, 120, 212, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={16} color="#38bdf8" />
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Instant State Snapshot Backup (JSON)
              </h4>
              <span className="badge-risk safe" style={{ fontSize: '9px', padding: '1px 5px', marginLeft: 'auto' }}>100% Reliable</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Captures all system toggle states, service configurations, and registry parameters for an instant 1-click restore without requiring VSS shadow storage.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Snapshot name..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button 
                className="btn"
                disabled={isSubmitting}
                onClick={handleCreateSnapshot}
              >
                <History size={15} />
                <span>Save Snapshot</span>
              </button>
            </div>
          </div>

          {/* Saved Snapshots List */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Saved State Snapshots ({snapshots.length})
            </h4>
            {snapshots.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                No state snapshots saved yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {snapshots.map((snap) => (
                  <div 
                    key={snap.id}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{snap.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Created: {snap.createdAt}</div>
                    </div>
                    <button 
                      className="btn btn-sm"
                      onClick={() => onRollbackSnapshot(snap.id)}
                    >
                      <RotateCcw size={12} />
                      <span>Rollback</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
