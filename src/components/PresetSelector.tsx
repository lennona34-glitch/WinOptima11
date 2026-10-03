import React from 'react';
import { ShieldCheck, Zap, Gamepad2, Lock, ArrowRight } from 'lucide-react';
import { PresetProfile } from '../types/optimizer';

interface PresetSelectorProps {
  presets: PresetProfile[];
  onApplyPreset: (presetId: string) => void;
  isProcessing?: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  onApplyPreset,
  isProcessing
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck size={20} color="#34d399" />;
      case 'Zap': return <Zap size={20} color="#38bdf8" />;
      case 'Gamepad2': return <Gamepad2 size={20} color="#c084fc" />;
      case 'Lock': return <Lock size={20} color="#00b7c3" />;
      default: return <Zap size={20} />;
    }
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            1-Click Optimization Profiles
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Apply curated multi-tweak profiles tested for stability and performance.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {presets.map((preset) => (
          <div 
            key={preset.id} 
            className="fluent-card"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              position: 'relative',
              cursor: 'default'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getIcon(preset.icon)}
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{preset.name}</span>
                </div>
                <span className="badge-risk recommended" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {preset.badge}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '12px' }}>
                {preset.description}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                <strong>Best for:</strong> {preset.recommendedFor}
              </div>

              <button
                className="btn btn-primary"
                disabled={isProcessing}
                onClick={() => onApplyPreset(preset.id)}
                style={{ width: '100%', fontSize: '12.5px', padding: '8px 12px' }}
              >
                <span>Apply Profile ({preset.tweakIds.length} tweaks)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
