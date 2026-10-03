import React from 'react';
import { Gamepad2, Zap, Gauge, Crosshair, Radio } from 'lucide-react';
import { TweakItem } from '../types/optimizer';
import { TweakCard } from '../components/TweakCard';

interface GamingViewProps {
  tweaks: TweakItem[];
  onToggleTweak: (id: string, enable: boolean) => void;
  onRevertTweak: (id: string) => void;
  onInspectScript: (tweak: TweakItem) => void;
  isProcessing?: boolean;
}

export const GamingView: React.FC<GamingViewProps> = ({
  tweaks,
  onToggleTweak,
  onRevertTweak,
  onInspectScript,
  isProcessing
}) => {
  const gamingTweaks = tweaks.filter(t => t.category === 'gaming');

  return (
    <div>
      {/* Gaming Engine Header Banner */}
      <div 
        className="fluent-card" 
        style={{ 
          marginBottom: '20px', 
          background: 'linear-gradient(135deg, rgba(135, 100, 184, 0.15) 0%, rgba(0, 120, 212, 0.1) 100%)',
          borderColor: 'rgba(135, 100, 184, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div style={{ padding: '10px', background: 'rgba(135, 100, 184, 0.25)', borderRadius: '10px', color: '#c084fc' }}>
          <Gamepad2 size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Low-Latency Gaming & Frame Rate Optimizer
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Eliminates DPC latency spikes, input lag from background recording, network packet throttling, and thread contention.
          </p>
        </div>
      </div>

      {/* Latency Tips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="fluent-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Gauge size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Input Lag Elimination</span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Disabling Xbox Game DVR prevents the 60fps video buffer encoder from holding GPU frame locks.
          </p>
        </div>

        <div className="fluent-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Zap size={16} color="#34d399" />
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>MMCSS Priority</span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Forces Windows scheduler to allocate 100% responsiveness to the active game window.
          </p>
        </div>

        <div className="fluent-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Radio size={16} color="#c084fc" />
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Zero Network Throttle</span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Disables the default Windows 10-packet-per-millisecond rate limiter for online multiplayer.
          </p>
        </div>
      </div>

      {/* Tweaks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {gamingTweaks.map((tweak) => (
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
  );
};
