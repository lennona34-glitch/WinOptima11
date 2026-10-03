import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode } from 'lucide-react';
import { TweakItem } from '../types/optimizer';

interface ScriptModalProps {
  tweak: TweakItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  tweak,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'enable' | 'disable' | 'revert'>('enable');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tweak) return null;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'enable':
        return tweak.powershellEnable;
      case 'disable':
        return tweak.powershellDisable;
      case 'revert':
        return tweak.revertToDefault;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', background: 'rgba(0, 120, 212, 0.15)', borderRadius: '8px', color: '#38bdf8' }}>
              <FileCode size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                PowerShell & Registry Inspector
              </h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                {tweak.name}
              </p>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'enable' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('enable')}
            >
              Enable Script
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'disable' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('disable')}
            >
              Disable Script
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'revert' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('revert')}
            >
              Factory Revert Script
            </button>
          </div>

          {/* Registry Key Meta */}
          {tweak.registryKey && (
            <div style={{ marginBottom: '12px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Target Registry Key: </span>
              <code style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{tweak.registryKey}</code>
            </div>
          )}

          {/* Code Viewer */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleCopy}
              className="btn btn-sm"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255,255,255,0.1)',
                zIndex: 5
              }}
            >
              {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <pre
              style={{
                background: 'var(--bg-terminal)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-card)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#7dd3fc',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '260px',
                overflowY: 'auto'
              }}
            >
              {getActiveCode()}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
