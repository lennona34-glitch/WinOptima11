import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Trash2, 
  Lock, 
  Gamepad2, 
  HardDrive, 
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';
import { CategoryType } from '../types/optimizer';

interface NavigationProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  activeTweaksCount: number;
  isLogConsoleOpen: boolean;
  onToggleLogConsole: () => void;
  isAdmin: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeCategory,
  onSelectCategory,
  activeTweaksCount,
  isLogConsoleOpen,
  onToggleLogConsole,
  isAdmin
}) => {
  const navItems: { id: CategoryType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'safeguards', label: 'Safety & Safeguards', icon: <ShieldCheck size={18} />, badge: 'Priority' },
    { id: 'performance', label: 'Performance & Boot', icon: <Zap size={18} /> },
    { id: 'debloat', label: 'Debloat & Explorer', icon: <Trash2 size={18} /> },
    { id: 'privacy', label: 'Privacy & Telemetry', icon: <Lock size={18} /> },
    { id: 'gaming', label: 'Gaming & Latency', icon: <Gamepad2 size={18} /> },
    { id: 'cleaner', label: 'Smart Storage Cleaner', icon: <HardDrive size={18} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Activity size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div className="brand-title">
            WinOptima <span className="brand-badge">11</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            Fluent Optimization Suite
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="badge-risk safe" style={{ fontSize: '9.5px', padding: '1px 6px', marginLeft: 'auto' }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '12px' }}>System Diagnostics</div>
        <div 
          className={`nav-item ${isLogConsoleOpen ? 'active' : ''}`}
          onClick={onToggleLogConsole}
        >
          <Terminal size={18} />
          <span>Execution Console</span>
          <span className="nav-badge">Live</span>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <span className="pulse-dot"></span>
          <span style={{ fontWeight: 600 }}>Windows 11 Live</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: isAdmin ? '#34d399' : '#fbbf24' }}>
            {isAdmin ? 'Elevated' : 'Standard User'}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Active Tweaks:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activeTweaksCount} applied</span>
        </div>
      </div>
    </aside>
  );
};
