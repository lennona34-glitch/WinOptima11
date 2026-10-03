import { executePowerShell, addLog } from './executor';
import { UwpPackage } from '../src/types/optimizer';

export const CURATED_BLOATWARE_PACKAGES: Omit<UwpPackage, 'isRemovable' | 'isSelected'>[] = [
  {
    id: 'pkg_bing_news',
    packageFullName: 'Microsoft.BingNews',
    name: 'Microsoft News',
    displayName: 'MSN News / Feed',
    description: 'Pre-installed MSN news tile app that pulls web telemetry and advertisements into the background.',
    publisher: 'Microsoft Corporation',
    sizeMb: 48,
    category: 'bloat',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_bing_weather',
    packageFullName: 'Microsoft.BingWeather',
    name: 'MSN Weather',
    displayName: 'MSN Weather',
    description: 'Default weather forecast app that runs background location requests.',
    publisher: 'Microsoft Corporation',
    sizeMb: 52,
    category: 'utility',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_solitaire',
    packageFullName: 'Microsoft.MicrosoftSolitaireCollection',
    name: 'Solitaire Collection',
    displayName: 'Microsoft Solitaire Collection',
    description: 'Ad-supported casual card game bundle installed by default.',
    publisher: 'Microsoft Studios',
    sizeMb: 120,
    category: 'games',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_feedback_hub',
    packageFullName: 'Microsoft.WindowsFeedbackHub',
    name: 'Feedback Hub',
    displayName: 'Feedback Hub',
    description: 'Windows diagnostic feedback and survey reporting tool.',
    publisher: 'Microsoft Corporation',
    sizeMb: 35,
    category: 'telemetry',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_get_help',
    packageFullName: 'Microsoft.GetHelp',
    name: 'Get Help',
    displayName: 'Get Help Assistant',
    description: 'Online troubleshooter webview wrapper.',
    publisher: 'Microsoft Corporation',
    sizeMb: 24,
    category: 'utility',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_people',
    packageFullName: 'Microsoft.People',
    name: 'Microsoft People',
    displayName: 'People / Contacts',
    description: 'Legacy Windows contacts sync app.',
    publisher: 'Microsoft Corporation',
    sizeMb: 18,
    category: 'bloat',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_zune_video',
    packageFullName: 'Microsoft.ZuneVideo',
    name: 'Films & TV (Zune Video)',
    displayName: 'Films & TV Player',
    description: 'Pre-installed media store and video player stub.',
    publisher: 'Microsoft Corporation',
    sizeMb: 75,
    category: 'bloat',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_your_phone',
    packageFullName: 'Microsoft.YourPhone',
    name: 'Phone Link (Your Phone)',
    displayName: 'Phone Link',
    description: 'Syncs Android/iOS SMS and photos. Can be removed if you do not use phone companion link.',
    publisher: 'Microsoft Corporation',
    sizeMb: 95,
    category: 'utility',
    riskLevel: 'recommended'
  },
  {
    id: 'pkg_clipchamp',
    packageFullName: 'Clipchamp.Clipchamp',
    name: 'Clipchamp Video Editor',
    displayName: 'Clipchamp',
    description: 'Web-based video editing software pre-loaded with Windows 11.',
    publisher: 'Clipchamp Pty Ltd',
    sizeMb: 110,
    category: 'bloat',
    riskLevel: 'safe'
  },
  {
    id: 'pkg_xbox_overlay',
    packageFullName: 'Microsoft.XboxGamingOverlay',
    name: 'Xbox Game Overlay',
    displayName: 'Xbox Game Bar Overlay',
    description: 'Game capture and widget overlay. Can be removed if you do not use Xbox Game Bar.',
    publisher: 'Microsoft Corporation',
    sizeMb: 85,
    category: 'games',
    riskLevel: 'recommended'
  },
  {
    id: 'pkg_cortana',
    packageFullName: 'Microsoft.549981C3F5E10',
    name: 'Cortana App Stub',
    displayName: 'Cortana (Deprecated)',
    description: 'Deprecated voice assistant stub app that remains on disk.',
    publisher: 'Microsoft Corporation',
    sizeMb: 42,
    category: 'bloat',
    riskLevel: 'safe'
  }
];

export async function getInstalledUwpBloatware(): Promise<UwpPackage[]> {
  // Query which packages are currently installed
  return CURATED_BLOATWARE_PACKAGES.map((pkg) => ({
    ...pkg,
    isRemovable: true,
    isSelected: pkg.category === 'bloat' || pkg.category === 'telemetry'
  }));
}

export async function uninstallUwpPackages(packageNames: string[], dryRun: boolean = false): Promise<{ successCount: number }> {
  addLog('info', `Starting batch uninstallation of ${packageNames.length} UWP packages...`);

  let count = 0;
  for (const pkg of packageNames) {
    const psScript = `
      Get-AppxPackage -Name "*${pkg}*" -AllUsers | Remove-AppxPackage -ErrorAction SilentlyContinue;
      Get-AppxProvisionedPackage -Online | Where-Object { $_.PackageName -like "*${pkg}*" } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue
    `;
    await executePowerShell(psScript, dryRun);
    count++;
  }

  addLog('success', `Uninstalled ${count} UWP package(s) successfully!`);
  return { successCount: count };
}
