import React, { useState, useEffect } from 'react';
import { Zap, Play, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { TweakItem, StartupItem } from '../types/optimizer';
import { TweakCard } from '../components/TweakCard';
import { fetchStartupItems, toggleStartupItem } from '../utils/api';

interface PerformanceViewProps {
  tweaks: TweakItem[];
  onToggleTweak: (id: string, enable: boolean) => void;
  onRevertTweak: (id: string) => void;
  onInspectScript: (tweak: TweakItem) => void;
  dryRun: boolean;
  isProcessing?: boolean;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  tweaks,
  onToggleTweak,
  onRevertTweak,
  onInspectScript,
  dryRun,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState<'tweaks' | 'startup'>('tweaks');
  const [startupItems, setStartupItems] = useState<StartupItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingStartup, setIsLoadingStartup] = useState(false);

  const performanceTweaks = tweaks.filter(t => t.category === 'performance');

  const loadStartup = async () => {
    setIsLoadingStartup(true);
    try {
      const items = await fetchStartupItems();
      setStartupItems(items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStartup(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'startup') {
      loadStartup();
    }
  }, [activeTab]);

  const handleToggleStartup = async (item: StartupItem, newEnabled: boolean) => {
    await toggleStartupItem(item.id, item.name, newEnabled, dryRun);
    setStartupItems(prev => prev.map(i => i.id === item.id ? { ...i, enabled: newEnabled } : i));
  };

  const filteredStartup = startupItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.publisher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Sub navigation tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'tweaks' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('tweaks')}
        >
          <Zap size={15} />
          <span>System & Hardware Tweaks ({performanceTweaks.length})</span>
        </button>
        <button
          className={`btn ${activeTab === 'startup' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('startup')}
        >
          <Play size={15} />
          <span>Startup Apps & Boot Manager</span>
        </button>
      </div>

      {activeTab === 'tweaks' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {performanceTweaks.map((tweak) => (
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
          {/* Search bar & Refresh */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search startup apps, publishers, or commands..."
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
            <button className="btn" onClick={loadStartup} disabled={isLoadingStartup}>
              <RefreshCw size={14} className={isLoadingStartup ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Startup Table */}
          <div className="fluent-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1.5fr 1fr 80px', 
              padding: '12px 20px', 
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid var(--border-subtle)',
              fontWeight: 700,
              fontSize: '12px',
              color: 'var(--text-tertiary)'
            }}>
              <span>Application & Command</span>
              <span>Publisher / Location</span>
              <span>Boot Impact</span>
              <span style={{ textAlign: 'right' }}>Status</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredStartup.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No startup applications found matching your query.
                </div>
              ) : (
                filteredStartup.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 1fr 80px',
                      alignItems: 'center',
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '13px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', wordBreak: 'break-all' }}>
                        {item.command}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>{item.publisher}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.location}</div>
                    </div>

                    <div>
                      <span className={`badge-risk ${item.impact === 'High' ? 'danger' : item.impact === 'Medium' ? 'advanced' : 'safe'}`}>
                        {item.impact}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => handleToggleStartup(item, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
