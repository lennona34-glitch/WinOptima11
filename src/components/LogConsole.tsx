import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { LogEntry } from '../types/optimizer';

interface LogConsoleProps {
  isOpen: boolean;
  onToggle: () => void;
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogConsole: React.FC<LogConsoleProps> = ({
  isOpen,
  onToggle,
  logs,
  onClearLogs
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  return (
    <div 
      className="log-console" 
      style={{ 
        height: isOpen ? '220px' : '36px',
        borderTop: '1px solid var(--border-card)'
      }}
    >
      {/* Header */}
      <div className="log-header" onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color="#38bdf8" />
          <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
            Windows Execution & Telemetry Console
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            ({logs.length} entries)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          {isOpen && (
            <button 
              className="btn btn-sm" 
              onClick={onClearLogs}
              style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
              title="Clear Console Output"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
          <button 
            className="btn btn-icon btn-sm" 
            onClick={onToggle}
            style={{ width: '24px', height: '24px' }}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="log-body">
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-tertiary)', padding: '8px 0' }}>
              No execution events recorded yet. Perform an action to view live output.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-line">
                <span className="log-time">[{log.timestamp}]</span>
                <span className={`log-tag ${log.level}`}>[{log.level.toUpperCase()}]</span>
                <span className="log-text">{log.message}</span>
                {log.command && (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginLeft: '6px' }}>
                    cmd: {log.command.slice(0, 75)}...
                  </span>
                )}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
};
