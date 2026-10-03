import React from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Play, 
  TestTube,
  CheckCircle2
} from 'lucide-react';
import { CategoryType } from '../types/optimizer';

interface HeaderProps {
  activeCategory: CategoryType;
  dryRun: boolean;
  onToggleDryRun: () => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onOpenRestoreModal: () => void;
  onRevertAll: () => void;
  isAdmin: boolean;
}

const CATEGORY_META: Record<CategoryType, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'System Overview & Quick Boost',
    subtitle: 'Real-time telemetry, 1-click optimization profiles, and active safeguard status'
  },
  safeguards: {
    title: 'Safety & System Safeguards',
    subtitle: 'Windows System Restore checkpoints, state snapshots, and one-click rollbacks'
  },
  performance: {
    title: 'Performance & Resource Management',
    subtitle: 'Power schemes, GPU scheduling, startup applications, and background service optimization'
  },
  debloat: {
    title: 'Windows 11 Debloater & Explorer',
    subtitle: 'Remove pre-installed UWP bloatware packages, restore classic context menus, and eliminate ads'
  },
  privacy: {
    title: 'Privacy & Telemetry Hardening',
    subtitle: 'Block diagnostic telemetry, turn off Copilot AI, wipe activity feeds, and stop keystroke tracking'
  },
  gaming: {
    title: 'Gaming & Low Latency Optimization',
    subtitle: 'MMCSS scheduler tuning, Game DVR buffer elimination, and foreground process prioritization'
  },
  cleaner: {
    title: 'Smart Storage & Cache Cleaner',
    subtitle: 'Safely scan and purge system temp directories, Windows Update cache, and shader caches'
  }
};

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  dryRun,
  onToggleDryRun,
  isLightTheme,
  onToggleTheme,
  onOpenRestoreModal,
  onRevertAll,
  isAdmin
}) => {
  const meta = CATEGORY_META[activeCategory] || { title: 'WinOptima 11', subtitle: 'Windows 11 Optimizer' };

  return (
    <header className="top-header">
      <div className="header-left">
        <div>
          <div className="page-title">{meta.title}</div>
          <div className="page-subtitle">{meta.subtitle}</div>
        </div>
      </div>

      <div className="header-actions">
        {/* Dry-Run / Test Mode Toggle */}
        <button 
          className={`btn ${dryRun ? 'btn-primary' : ''}`}
          onClick={onToggleDryRun}
          title={dryRun ? 'Dry-Run Active: Commands will be simulated without writing changes' : 'Live Execution Mode'}
          style={{
            borderColor: dryRun ? '#38bdf8' : 'var(--border-card)',
            background: dryRun ? 'rgba(0, 120, 212, 0.2)' : 'var(--bg-card)',
            color: dryRun ? '#38bdf8' : 'var(--text-secondary)'
          }}
        >
          <TestTube size={15} />
          <span>{dryRun ? 'Dry-Run (Simulated)' : 'Live Mode'}</span>
        </button>

        {/* Create Restore Point Button */}
        <button className="btn" onClick={onOpenRestoreModal}>
          <ShieldCheck size={15} color="#34d399" />
          <span>Restore Point</span>
        </button>

        {/* 1-Click Rollback */}
        <button className="btn btn-danger btn-sm" onClick={onRevertAll} title="Reset all modified settings back to Windows factory defaults">
          <RotateCcw size={14} />
          <span>Reset to Defaults</span>
        </button>

        {/* Theme Toggle */}
        <button className="btn btn-icon" onClick={onToggleTheme} title="Toggle Light/Dark Theme">
          {isLightTheme ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
};
