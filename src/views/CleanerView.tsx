import React, { useState, useEffect } from 'react';
import { HardDrive, Trash2, CheckSquare, Square, RefreshCw, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CleanTarget } from '../types/optimizer';
import { fetchCleanTargets, runClean } from '../utils/api';

interface CleanerViewProps {
  dryRun: boolean;
}

export const CleanerView: React.FC<CleanerViewProps> = ({ dryRun }) => {
  const [targets, setTargets] = useState<CleanTarget[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedResult, setCleanedResult] = useState<string | null>(null);

  const scan = async () => {
    setIsScanning(true);
    setCleanedResult(null);
    try {
      const data = await fetchCleanTargets();
      setTargets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scan();
  }, []);

  const handleToggle = (id: string) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const handleSelectAll = (select: boolean) => {
    setTargets(prev => prev.map(t => ({ ...t, selected: select })));
  };

  const handleExecuteClean = async () => {
    const selectedIds = targets.filter(t => t.selected).map(t => t.id);
    if (selectedIds.length === 0) return;

    setIsCleaning(true);
    try {
      const res = await runClean(selectedIds, dryRun);
      setCleanedResult(`Successfully cleaned junk! Reclaimed ~${res.formattedFreed} of disk space.`);
      // Rescan
      await scan();
    } catch (e: any) {
      setCleanedResult(`Clean error: ${e.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const selectedTargets = targets.filter(t => t.selected);
  const totalSelectedBytes = selectedTargets.reduce((acc, t) => acc + t.sizeBytes, 0);
  const formattedSelectedSize = totalSelectedBytes > 0 
    ? (totalSelectedBytes / (1024 * 1024)).toFixed(1) + ' MB'
    : '0 MB';

  return (
    <div>
      {/* Banner */}
      <div 
        className="fluent-card" 
        style={{ 
          marginBottom: '20px', 
          background: 'rgba(16, 185, 129, 0.08)', 
          borderColor: 'rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '10px', color: '#34d399' }}>
            <HardDrive size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Smart Storage & Windows Cache Cleaner
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Unlike destructive registry cleaners, WinOptima safely purges genuine temporary directories, update caches, and shader buffers.
            </p>
          </div>
        </div>

        <button className="btn" onClick={scan} disabled={isScanning}>
          <RefreshCw size={14} className={isScanning ? 'spin' : ''} />
          <span>{isScanning ? 'Scanning...' : 'Rescan Storage'}</span>
        </button>
      </div>

      {cleanedResult && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'var(--status-safe-bg)',
          border: '1px solid var(--status-safe-border)',
          color: '#34d399',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px'
        }}>
          <CheckCircle2 size={18} />
          <span>{cleanedResult}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="fluent-card" style={{ padding: '16px 20px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={() => handleSelectAll(true)}>
            <span>Select All</span>
          </button>
          <button className="btn btn-sm" onClick={() => handleSelectAll(false)}>
            <span>Deselect All</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Cleanable Space: <strong style={{ color: '#34d399', fontSize: '15px' }}>{formattedSelectedSize}</strong>
          </span>
          <button 
            className="btn btn-primary"
            disabled={selectedTargets.length === 0 || isCleaning}
            onClick={handleExecuteClean}
            style={{ padding: '8px 18px' }}
          >
            <Trash2 size={15} />
            <span>{isCleaning ? 'Cleaning Junk...' : 'Clean Selected Targets'}</span>
          </button>
        </div>
      </div>

      {/* Targets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {targets.map((target) => (
          <div
            key={target.id}
            className="fluent-card"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
              borderColor: target.selected ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-card)',
              background: target.selected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)'
            }}
            onClick={() => handleToggle(target.id)}
          >
            <div style={{ marginTop: '2px' }}>
              {target.selected ? (
                <CheckSquare size={18} color="#34d399" />
              ) : (
                <Square size={18} color="var(--text-tertiary)" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{target.name}</span>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#34d399' }}>{target.formattedSize}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {target.description}
              </p>
              <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <span>Location: <code style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{target.path}</code></span>
                {target.fileCount && <span>{target.fileCount} files scanned</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
