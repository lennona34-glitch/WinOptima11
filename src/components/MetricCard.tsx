import React from 'react';
import { Cpu, MemoryStick, HardDrive, Wifi, Clock, BatteryCharging } from 'lucide-react';
import { HardwareStats } from '../types/optimizer';

interface MetricCardProps {
  stats: HardwareStats | null;
}

export const MetricCard: React.FC<MetricCardProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="fluent-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Gathering Windows 11 hardware telemetry...
      </div>
    );
  }

  const getProgressColor = (pct: number) => {
    if (pct < 60) return '#34d399'; // green
    if (pct < 85) return '#fbbf24'; // yellow
    return '#f87171'; // red
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {/* CPU Usage */}
      <div className="fluent-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(0, 120, 212, 0.15)', borderRadius: '8px', color: '#38bdf8' }}>
              <Cpu size={18} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>Processor</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: getProgressColor(stats.cpuUsage) }}>
            {stats.cpuUsage}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
          <div 
            style={{ 
              width: `${Math.max(4, stats.cpuUsage)}%`, 
              height: '100%', 
              background: getProgressColor(stats.cpuUsage),
              transition: 'width 0.4s ease, background 0.4s ease'
            }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          <span>{stats.cpuCores} Threads</span>
          <span>{stats.cpuSpeed}</span>
        </div>
      </div>

      {/* RAM Usage */}
      <div className="fluent-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(135, 100, 184, 0.15)', borderRadius: '8px', color: '#c084fc' }}>
              <MemoryStick size={18} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>Memory (RAM)</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: getProgressColor(stats.ramPercent) }}>
            {stats.ramPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
          <div 
            style={{ 
              width: `${Math.max(4, stats.ramPercent)}%`, 
              height: '100%', 
              background: getProgressColor(stats.ramPercent),
              transition: 'width 0.4s ease, background 0.4s ease'
            }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          <span>{stats.ramUsedGb} GB Used</span>
          <span>{stats.ramTotalGb} GB Total</span>
        </div>
      </div>

      {/* Primary Disk C: */}
      <div className="fluent-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#34d399' }}>
              <HardDrive size={18} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>System Drive (C:)</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: getProgressColor(stats.diskPercent) }}>
            {stats.diskPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
          <div 
            style={{ 
              width: `${Math.max(4, stats.diskPercent)}%`, 
              height: '100%', 
              background: getProgressColor(stats.diskPercent),
              transition: 'width 0.4s ease, background 0.4s ease'
            }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          <span>{stats.diskUsedGb} GB Used</span>
          <span>{stats.diskTotalGb} GB Size</span>
        </div>
      </div>

      {/* Network & Uptime */}
      <div className="fluent-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(0, 183, 195, 0.15)', borderRadius: '8px', color: '#00b7c3' }}>
              <Wifi size={18} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>Network & Power</span>
          </div>
          <span style={{ fontSize: '12px', padding: '3px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', color: 'var(--text-secondary)' }}>
            {stats.powerScheme}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Throughput:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>↓ {stats.networkInKbps} KB/s  ↑ {stats.networkOutKbps} KB/s</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Uptime:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.uptimeHours} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
