import React from 'react';
import { Lock, ShieldAlert, EyeOff, Key, Radio, Sparkles } from 'lucide-react';
import { TweakItem } from '../types/optimizer';
import { TweakCard } from '../components/TweakCard';

interface PrivacyViewProps {
  tweaks: TweakItem[];
  onToggleTweak: (id: string, enable: boolean) => void;
  onRevertTweak: (id: string) => void;
  onInspectScript: (tweak: TweakItem) => void;
  isProcessing?: boolean;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({
  tweaks,
  onToggleTweak,
  onRevertTweak,
  onInspectScript,
  isProcessing
}) => {
  const privacyTweaks = tweaks.filter(t => t.category === 'privacy');

  return (
    <div>
      {/* Privacy Notice Banner */}
      <div 
        className="fluent-card" 
        style={{ 
          marginBottom: '20px', 
          background: 'rgba(0, 183, 195, 0.08)', 
          borderColor: 'rgba(0, 183, 195, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div style={{ padding: '8px', background: 'rgba(0, 183, 195, 0.2)', borderRadius: '8px', color: '#00b7c3' }}>
          <EyeOff size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Windows 11 Telemetry & Cloud Snooping Protection
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            By default, Windows 11 gathers telemetry, voice and typing models, search queries, and crash reports. These switches enforce local-only execution and block telemetry pipelines.
          </p>
        </div>
      </div>

      {/* Tweaks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {privacyTweaks.map((tweak) => (
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
