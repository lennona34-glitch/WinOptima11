import React, { useState, useEffect } from 'react';
import { Trash2, CheckSquare, Square, Search, RefreshCw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { TweakItem, UwpPackage } from '../types/optimizer';
import { TweakCard } from '../components/TweakCard';
import { fetchUwpPackages, uninstallUwp } from '../utils/api';

interface DebloatViewProps {
  tweaks: TweakItem[];
  onToggleTweak: (id: string, enable: boolean) => void;
  onRevertTweak: (id: string) => void;
  onInspectScript: (tweak: TweakItem) => void;
  dryRun: boolean;
  isProcessing?: boolean;
}

export const DebloatView: React.FC<DebloatViewProps> = ({
  tweaks,
  onToggleTweak,
  onRevertTweak,
  onInspectScript,
  dryRun,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState<'ui' | 'uwp'>('uwp');
  const [packages, setPackages] = useState<UwpPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const debloatTweaks = tweaks.filter(t => t.category === 'debloat');

  const loadPackages = async () => {
    try {
      const pkgs = await fetchUwpPackages();
      setPackages(pkgs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleToggleSelect = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, isSelected: !p.isSelected } : p));
  };

  const handleSelectAll = (select: boolean) => {
    setPackages(prev => prev.map(p => ({ ...p, isSelected: select })));
  };

  const handleSelectSafeOnly = () => {
    setPackages(prev => prev.map(p => ({ ...p, isSelected: p.riskLevel === 'safe' && (p.category === 'bloat' || p.category === 'telemetry') })));
  };

  const handleBatchUninstall = async () => {
    const selected = packages.filter(p => p.isSelected);
    if (selected.length === 0) return;

    setIsUninstalling(true);
    setStatusNotice(null);
    try {
      const names = selected.map(p => p.packageFullName);
      const res = await uninstallUwp(names, dryRun);
      setStatusNotice(`Successfully uninstalled ${res.successCount} UWP package(s)!`);
      // unselect uninstalled
      setPackages(prev => prev.map(p => p.isSelected ? { ...p, isSelected: false } : p));
    } catch (e: any) {
      setStatusNotice(`Uninstall error: ${e.message}`);
    } finally {
      setIsUninstalling(false);
    }
  };

  const selectedCount = packages.filter(p => p.isSelected).length;
  const totalReclaimMb = packages.filter(p => p.isSelected).reduce((acc, curr) => acc + curr.sizeMb, 0);

  const filteredPackages = packages.filter(p =>
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.packageFullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Sub navigation tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'uwp' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('uwp')}
        >
          <Trash2 size={15} />
          <span>UWP Bloatware Remover ({packages.length})</span>
        </button>
        <button
          className={`btn ${activeTab === 'ui' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('ui')}
        >
          <Sparkles size={15} />
          <span>Explorer & UI Simplifier ({debloatTweaks.length})</span>
        </button>
      </div>

      {activeTab === 'ui' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {debloatTweaks.map((tweak) => (
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
      ) : (
        <div>
          {statusNotice && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--status-safe-bg)',
              border: '1px solid var(--status-safe-border)',
              color: '#34d399',
              marginBottom: '16px',
              fontSize: '13px'
            }}>
              {statusNotice}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="fluent-card" style={{ padding: '16px 20px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-sm" onClick={handleSelectSafeOnly}>
                <ShieldCheck size={14} color="#34d399" />
                <span>Select Safe Bloat Only</span>
              </button>
              <button className="btn btn-sm" onClick={() => handleSelectAll(true)}>
                <span>Select All</span>
              </button>
              <button className="btn btn-sm" onClick={() => handleSelectAll(false)}>
                <span>Deselect All</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Selected: <strong style={{ color: 'var(--text-primary)' }}>{selectedCount}</strong> (~{totalReclaimMb} MB)
              </span>
              <button 
                className="btn btn-danger"
                disabled={selectedCount === 0 || isUninstalling}
                onClick={handleBatchUninstall}
              >
                <Trash2 size={15} />
                <span>{isUninstalling ? 'Uninstalling...' : `Uninstall Selected (${selectedCount})`}</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search pre-installed packages by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Package Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {filteredPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="fluent-card"
                style={{ 
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  borderColor: pkg.isSelected ? 'rgba(0, 120, 212, 0.4)' : 'var(--border-card)',
                  background: pkg.isSelected ? 'rgba(0, 120, 212, 0.06)' : 'var(--bg-card)',
                  cursor: 'pointer'
                }}
                onClick={() => handleToggleSelect(pkg.id)}
              >
                <div style={{ marginTop: '2px' }}>
                  {pkg.isSelected ? (
                    <CheckSquare size={18} color="#38bdf8" />
                  ) : (
                    <Square size={18} color="var(--text-tertiary)" />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>{pkg.displayName}</span>
                    <span className="badge-risk safe" style={{ fontSize: '9.5px', padding: '1px 5px' }}>{pkg.sizeMb} MB</span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: '1.4' }}>
                    {pkg.description}
                  </p>
                  <code style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {pkg.packageFullName}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
