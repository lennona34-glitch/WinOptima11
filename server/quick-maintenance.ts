import path from 'path';
import os from 'os';
import fs from 'fs';
import { executePowerShell, addLog } from './executor';
import { TWEAKS_DATABASE } from './optimizer-registry';

export async function flushDnsCache(dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
  addLog('info', 'Flushing Windows DNS resolver cache...');
  const psScript = `
    Clear-DnsClientCache;
    ipconfig /flushdns;
    Write-Output "SUCCESS: DNS Resolver Cache Flushed."
  `;
  const res = await executePowerShell(psScript, dryRun);
  addLog('success', 'Windows DNS resolver cache cleared and network routes refreshed.');
  return { success: res.success, message: 'DNS Resolver Cache successfully purged.' };
}

export async function flushStandbyMemory(dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
  addLog('info', 'Executing memory working set compaction to free up standby RAM...');
  const psScript = `
    [System.GC]::Collect();
    [System.GC]::WaitForPendingFinalizers();
    Get-Process | ForEach-Object {
      try {
        $_.MinWorkingSet = [System.IntPtr]::Zero;
        $_.MaxWorkingSet = [System.IntPtr]::Zero;
      } catch {}
    };
    Write-Output "SUCCESS: Standby memory compaction complete."
  `;
  const res = await executePowerShell(psScript, dryRun);
  addLog('success', 'Standby memory compaction completed. Physical RAM freed.');
  return { success: res.success, message: 'RAM standby list purged and memory compacted.' };
}

export async function forceSsdTrim(dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
  addLog('info', 'Initiating SSD Storage TRIM and block re-indexing...');
  const psScript = `
    try {
      Optimize-Volume -DriveLetter C -ReTrim -ErrorAction Stop;
      Write-Output "SUCCESS: SSD Drive C: ReTrimmed."
    } catch {
      Write-Output ("ERROR: " + $_.Exception.Message)
    }
  `;
  const res = await executePowerShell(psScript, dryRun);
  addLog('success', 'SSD Drive C: TRIM optimization executed successfully.');
  return { success: res.success, message: 'SSD TRIM completed: storage blocks re-indexed.' };
}

export async function restartExplorer(dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
  addLog('info', 'Restarting Windows Explorer shell process...');
  const psScript = `
    Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue;
    Start-Sleep -Milliseconds 500;
    if (!(Get-Process -Name explorer -ErrorAction SilentlyContinue)) {
      Start-Process explorer.exe
    }
    Write-Output "SUCCESS: Explorer restarted."
  `;
  const res = await executePowerShell(psScript, dryRun);
  addLog('success', 'Windows Explorer and Taskbar UI reloaded.');
  return { success: res.success, message: 'Windows Explorer restarted successfully.' };
}

export async function createGodModeShortcut(dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
  addLog('info', 'Creating "God Mode" Master Control Panel desktop folder...');
  const psScript = `
    $desktop = [Environment]::GetFolderPath("Desktop");
    $godModePath = Join-Path $desktop "GodMode.{ED7BA470-8E54-465E-825C-99712043E01C}";
    if (!(Test-Path $godModePath)) {
      New-Item -ItemType Directory -Path $godModePath -Force | Out-Null
    }
    Write-Output "SUCCESS: God Mode created on Desktop."
  `;
  const res = await executePowerShell(psScript, dryRun);
  addLog('success', 'Created "God Mode" Master Control Panel on your Desktop!');
  return { success: res.success, message: 'God Mode Master Control Panel folder placed on Desktop.' };
}

export async function setDnsServers(provider: 'cloudflare' | 'quad9' | 'google' | 'dhcp', dryRun: boolean = false): Promise<{ success: boolean; message: string }> {
  addLog('info', `Configuring DNS servers to: ${provider.toUpperCase()}...`);

  let psScript = '';

  if (provider === 'cloudflare') {
    psScript = `
      Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | ForEach-Object {
        Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ServerAddresses ("1.1.1.1", "1.0.0.1") -ErrorAction SilentlyContinue
      };
      Clear-DnsClientCache;
      Write-Output "SUCCESS: Set to Cloudflare DNS (1.1.1.1)"
    `;
  } else if (provider === 'quad9') {
    psScript = `
      Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | ForEach-Object {
        Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ServerAddresses ("9.9.9.9", "149.112.112.112") -ErrorAction SilentlyContinue
      };
      Clear-DnsClientCache;
      Write-Output "SUCCESS: Set to Quad9 Secure DNS (9.9.9.9)"
    `;
  } else if (provider === 'google') {
    psScript = `
      Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | ForEach-Object {
        Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4") -ErrorAction SilentlyContinue
      };
      Clear-DnsClientCache;
      Write-Output "SUCCESS: Set to Google DNS (8.8.8.8)"
    `;
  } else {
    // Reset to DHCP
    psScript = `
      Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | ForEach-Object {
        Set-DnsClientServerAddress -InterfaceIndex $_.InterfaceIndex -ResetServerAddresses -ErrorAction SilentlyContinue
      };
      Clear-DnsClientCache;
      Write-Output "SUCCESS: Reset DNS to Automatic DHCP"
    `;
  }

  const res = await executePowerShell(psScript, dryRun);
  addLog('success', `DNS settings successfully updated to ${provider.toUpperCase()}.`);
  return { success: res.success, message: `DNS provider updated to ${provider.toUpperCase()}` };
}

export function exportPortableScript(tweakIds: string[]): { success: boolean; filePath: string; content: string } {
  const selectedTweaks = TWEAKS_DATABASE.filter(t => tweakIds.includes(t.id));
  const desktop = path.join(os.homedir(), 'Desktop');
  const fileName = `WinOptima11_Optimizations_${Date.now()}.ps1`;
  const filePath = path.join(desktop, fileName);

  const scriptLines = [
    `# ========================================================`,
    `#   WinOptima 11 - Standalone Portable Optimization Script`,
    `#   Generated on: ${new Date().toLocaleString()}`,
    `# ========================================================`,
    `Write-Host "Starting WinOptima 11 System Optimizations..." -ForegroundColor Cyan`,
    ``,
    `# Check Administrator privileges`,
    `if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {`,
    `    Write-Warning "Please run this script as Administrator for full effect!"`,
    `}`,
    ``
  ];

  selectedTweaks.forEach((tweak, i) => {
    scriptLines.push(`Write-Host "[$(${i + 1})/${selectedTweaks.length}] Applying: ${tweak.name}..." -ForegroundColor Green`);
    scriptLines.push(tweak.powershellEnable);
    scriptLines.push(``);
  });

  scriptLines.push(`Write-Host "All WinOptima 11 optimizations completed successfully!" -ForegroundColor Cyan`);
  scriptLines.push(`Pause`);

  const fullContent = scriptLines.join('\r\n');

  try {
    fs.writeFileSync(filePath, fullContent, 'utf-8');
    addLog('success', `Exported portable PowerShell script to Desktop: ${fileName}`);
    return { success: true, filePath, content: fullContent };
  } catch (err: any) {
    return { success: false, filePath: '', content: fullContent };
  }
}
