import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Code, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Lock
} from 'lucide-react';
import { TweakItem, RiskLevel } from '../types/optimizer';

interface TweakCardProps {
  tweak: TweakItem;
  onToggle: (tweakId: string, enable: boolean) => void;
  onRevert: (tweakId: string) => void;
  onInspectScript: (tweak: TweakItem) => void;
  isProcessing?: boolean;
}

export const TweakCard: React.FC<TweakCardProps> = ({
  tweak,
  onToggle,
  onRevert,
  onInspectScript,
  isProcessing
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'safe':
        return <span className="badge-risk safe">Safe</span>;
      case 'recommended':
        return <span className="badge-risk recommended">Recommended</span>;
      case 'advanced':
        return <span className="badge-risk advanced">Advanced</span>;
      case 'danger':
        return <span className="badge-risk danger">Caution</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`tweak-card ${tweak.enabled ? 'enabled' : ''}`}>
      <div className="tweak-header">
        <div className="tweak-info">
          <div className="tweak-title-row">
            <span className="tweak-title">{tweak.name}</span>
            {getRiskBadge(tweak.riskLevel)}
            {tweak.requiresAdmin && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', color: 'var(--text-tertiary)' }} title="Requires Administrator Privileges">
                <Lock size={12} /> Admin
              </span>
            )}
          </div>
          <p className="tweak-desc">{tweak.description}</p>
        </div>

        {/* Toggle Switch */}
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={tweak.enabled}
            disabled={isProcessing}
            onChange={(e) => onToggle(tweak.id, e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {/* Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-sm" 
            onClick={() => onInspectScript(tweak)}
            title="Inspect PowerShell & Registry Commands"
            style={{ fontSize: '11.5px', padding: '4px 8px' }}
          >
            <Code size={13} />
            <span>Inspect Script</span>
          </button>

          <button 
            className="btn btn-sm" 
            onClick={() => onRevert(tweak.id)}
            title="Reset this setting to Windows default value"
            style={{ fontSize: '11.5px', padding: '4px 8px', color: 'var(--text-secondary)' }}
          >
            <RotateCcw size={12} />
            <span>Revert</span>
          </button>
        </div>

        <button 
          className="btn btn-sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ fontSize: '11.5px', padding: '4px 8px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)' }}
        >
          <span>{isExpanded ? 'Hide Details' : 'Details & Impact'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expandable Technical Impact */}
      {isExpanded && (
        <div style={{ 
          marginTop: '6px', 
          padding: '12px 14px', 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px', 
          fontSize: '12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Expected System Impact: </strong>
            <span style={{ color: 'var(--text-secondary)' }}>{tweak.impact}</span>
          </div>
          {tweak.registryKey && (
            <div style={{ wordBreak: 'break-all' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Registry Path: </strong>
              <code style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{tweak.registryKey}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
