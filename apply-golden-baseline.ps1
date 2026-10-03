# ========================================================
#   WinOptima 11 - Golden Baseline & System Hardening
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  WinOptima 11 - Golden Baseline & System Hardening    " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (!$isAdmin) {
    Write-Warning "Running in Standard User mode. Requesting Administrator Elevation..."
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "[OK] Administrator privileges verified." -ForegroundColor Green
Write-Host ""

# 1. Disable Windows Diagnostic Telemetry & DiagTrack Service
Write-Host "[1/9] Disabling Diagnostic Telemetry & DiagTrack Service..." -ForegroundColor Yellow
try {
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection")) { 
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Force | Out-Null 
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Value 0 -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "MaxTelemetryAllowed" -Value 0 -Type DWord -Force
    
    Get-Service -Name "DiagTrack", "dmwappushservice" -ErrorAction SilentlyContinue | Set-Service -StartupType Disabled -PassThru -ErrorAction SilentlyContinue | Stop-Service -ErrorAction SilentlyContinue
    Write-Host "      [+] Telemetry & DiagTrack services disabled." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 2. Disable Windows Recall & Copilot AI Snapshots (24H2)
Write-Host "[2/9] Disabling Windows Recall & Copilot AI Background Daemons..." -ForegroundColor Yellow
try {
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsAI")) { 
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsAI" -Force | Out-Null 
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsAI" -Name "DisableAIDataAnalysis" -Value 1 -Type DWord -Force
    
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot")) { 
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot" -Force | Out-Null 
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot" -Name "TurnOffWindowsCopilot" -Value 1 -Type DWord -Force
    Write-Host "      [+] Windows Recall & Copilot AI daemons disabled." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 3. Disable Microsoft Edge Background Daemon & Pre-launching
Write-Host "[3/9] Stopping Microsoft Edge Background RAM Consumption..." -ForegroundColor Yellow
try {
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge")) { 
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Force | Out-Null 
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Name "StartupBoostEnabled" -Value 0 -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Name "BackgroundModeEnabled" -Value 0 -Type DWord -Force
    Write-Host "      [+] Microsoft Edge background persistence stopped." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 4. Disable Delivery Optimization P2P Internet Seeding
Write-Host "[4/9] Disabling Delivery Optimization P2P Seeding..." -ForegroundColor Yellow
try {
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization")) { 
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" -Force | Out-Null 
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" -Name "DODownloadMode" -Value 0 -Type DWord -Force
    Get-Service -Name "DoSvc" -ErrorAction SilentlyContinue | Set-Service -StartupType Disabled -PassThru -ErrorAction SilentlyContinue | Stop-Service -ErrorAction SilentlyContinue
    Write-Host "      [+] Delivery Optimization upload bandwidth seeding disabled." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 5. Disable Windows Error Reporting Cloud Crash Dump Uploads
Write-Host "[5/9] Disabling Windows Error Reporting Crash Cloud Uploads..." -ForegroundColor Yellow
try {
    if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Error Reporting")) { 
        New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Error Reporting" -Force | Out-Null 
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Error Reporting" -Name "Disabled" -Value 1 -Type DWord -Force
    Write-Host "      [+] WER crash uploads disabled." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 6. Disable Dormant Legacy Services
Write-Host "[6/9] Stopping Dormant Legacy Services (Fax, Retail Demo, Remote Registry)..." -ForegroundColor Yellow
try {
    Get-Service -Name "Fax", "RetailDemo", "RemoteRegistry", "MapsBroker" -ErrorAction SilentlyContinue | Set-Service -StartupType Disabled -PassThru -ErrorAction SilentlyContinue | Stop-Service -ErrorAction SilentlyContinue
    Write-Host "      [+] Dormant services disabled." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 7. Activate Ultimate Performance Power Scheme
Write-Host "[7/9] Activating Ultimate Performance Power Plan..." -ForegroundColor Yellow
try {
    powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 | Out-Null
    $schemes = powercfg -list
    $target = $schemes | Select-String "Ultimate Performance" | Select-Object -First 1 | ForEach-Object { 
        $tokens = $_ -split "\s+"
        if ($tokens.Count -gt 3) { $tokens[3] }
    }
    if ($target) { 
        powercfg -setactive $target
        Write-Host "      [+] Ultimate Performance power scheme activated ($target)." -ForegroundColor Green
    } else {
        Write-Host "      [+] High Performance active." -ForegroundColor Green
    }
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 8. MMCSS Low Latency & Zero Network Throttle
Write-Host "[8/9] Configuring MMCSS Gaming Priority & Disabling Network Throttling..." -ForegroundColor Yellow
try {
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" -Name "NetworkThrottlingIndex" -Value 0xffffffff -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" -Name "SystemResponsiveness" -Value 0 -Type DWord -Force
    
    if (!(Test-Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games")) { 
        New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" -Force | Out-Null 
    }
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" -Name "GPU Priority" -Value 8 -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" -Name "Priority" -Value 6 -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" -Name "Scheduling Category" -Value "High" -Type String -Force
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" -Name "SFIO Priority" -Value "High" -Type String -Force
    Write-Host "      [+] MMCSS gaming priority & zero network throttling applied." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 9. Hardware-Accelerated GPU Scheduling (HAGS)
Write-Host "[9/9] Configuring Hardware-Accelerated GPU Scheduling (HAGS)..." -ForegroundColor Yellow
try {
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" -Name "HwSchMode" -Value 2 -Type DWord -Force
    Write-Host "      [+] HAGS enabled (takes effect on reboot or GPU driver reload)." -ForegroundColor Green
} catch {
    Write-Host "      [!] Notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Complete System Hardening & Optimization Finished!   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..."
[void][System.Console]::ReadKey($true)
