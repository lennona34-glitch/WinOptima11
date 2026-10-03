export type RiskLevel = 'safe' | 'recommended' | 'advanced' | 'danger';

export type CategoryType = 
  | 'dashboard'
  | 'performance' 
  | 'debloat' 
  | 'privacy' 
  | 'gaming' 
  | 'cleaner' 
  | 'safeguards';

export interface TweakItem {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'debloat' | 'privacy' | 'gaming' | 'cleaner' | 'safeguards';
  riskLevel: RiskLevel;
  enabled: boolean;
  isApplied?: boolean;
  requiresAdmin: boolean;
  registryKey?: string;
  powershellEnable: string;
  powershellDisable: string;
  revertToDefault: string;
  impact: string;
  tags?: string[];
  lastModified?: string;
}

export interface HardwareStats {
  cpuUsage: number;
  cpuSpeed: string;
  cpuCores: number;
  cpuModel: string;
  ramUsedGb: number;
  ramTotalGb: number;
  ramPercent: number;
  diskUsedGb: number;
  diskTotalGb: number;
  diskPercent: number;
  networkInKbps: number;
  networkOutKbps: number;
  uptimeHours: number;
  osName: string;
  osBuild: string;
  powerScheme: string;
  isAdmin: boolean;
  restorePointsCount: number;
}

export interface RestorePointItem {
  id: string;
  sequenceNumber?: number;
  description: string;
  timestamp: string;
  creationTime?: string;
  eventType?: string;
  restorePointType?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  command?: string;
  output?: string;
}

export interface CleanTarget {
  id: string;
  name: string;
  description: string;
  sizeBytes: number;
  formattedSize: string;
  path: string;
  selected: boolean;
  isSafe: boolean;
  fileCount?: number;
}

export interface StartupItem {
  id: string;
  name: string;
  publisher: string;
  command: string;
  location: string;
  enabled: boolean;
  impact: 'Low' | 'Medium' | 'High';
}

export interface UwpPackage {
  id: string;
  packageFullName: string;
  name: string;
  displayName: string;
  description: string;
  publisher: string;
  sizeMb: number;
  isRemovable: boolean;
  isSelected: boolean;
  category: 'bloat' | 'social' | 'games' | 'telemetry' | 'utility';
  riskLevel: RiskLevel;
}

export interface PresetProfile {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: string;
  recommendedFor: string;
  tweakIds: string[];
}

export interface SystemSnapshot {
  id: string;
  name: string;
  createdAt: string;
  tweakStates: Record<string, boolean>;
  osBuild: string;
}
