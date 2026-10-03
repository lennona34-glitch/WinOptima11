# WinOptima 11 - Windows 11 Optimization, Debloating & Hardening Suite

WinOptima 11 is a next-generation Windows 11 system optimizer, privacy hardener, debloater, and performance tuning suite built with the **WinUI 3 Fluent Design System**.

---

## 🌟 Key Features

### 🛡️ 1. Safety & System Safeguards (Crucial First Step)
- **Windows System Restore Point Generator**: Integrates with native Windows VSS (`Checkpoint-Computer`) to create a recovery checkpoint before applying optimizations.
- **1-Click Factory Default Rollback**: Easily revert any individual tweak or reset the entire system back to standard Windows 11 factory defaults.
- **State Snapshot Backups**: Export and import full `.json` configuration backups in the `.snapshots` directory.
- **Safety Risk Tiers**:
  - 🟢 **Safe (Tier 1)**: Zero system risk (e.g. Cache clean, start suggestions, classic context menu).
  - 🟡 **Recommended (Tier 2)**: Significant privacy/speed boost with zero downsides for 99% of users (e.g. DiagTrack off, Game DVR off).
  - 🟠 **Advanced (Tier 3)**: Power user settings (e.g. NTFS file system cache boost, custom thread quantum).
  - 🔴 **Caution (Tier 4)**: Requires manual user verification.
- **Dry-Run & Script Inspector**: Inspect exact PowerShell / Registry scripts with syntax highlighting and dry-run simulation mode.

### 🚀 2. Performance & Resource Management
- **Startup Apps Manager**: Inspect startup keys (`HKCU\Run`, `HKLM\Run`), assess boot impacts (High / Medium / Low), and toggle startup programs.
- **Universal Background Apps Lock**: Stop background UWP apps from silently consuming battery, RAM, and CPU cycles.
- **Service Optimizer**: Disable dormant, resource-heavy legacy services (Fax, Retail Demo, MapsBroker, Remote Registry).
- **Ultimate Performance & HAGS**: Activate the Ultimate Performance power scheme and toggle Hardware-Accelerated GPU Scheduling.

### 🧼 3. Windows 11 Debloating & Storage Cleanup
- **UWP Package Bloatware Remover**: Cleanly batch-uninstall pre-installed bloatware (MSN News, Weather, Solitaire, Xbox Bar, Feedback Hub, Clipchamp, Cortana stub).
- **Smart Junk & Cache Cleaner**: Safely purges `%TEMP%`, `C:\Windows\Temp`, `SoftwareDistribution\Download` (Windows Update cache), DirectX Shader Cache, and Crash Dumps.
- **Explorer & UI Simplifier**: 1-click restore of the classic Windows 10 full right-click context menu (no more "Show more options"), hide taskbar widgets, and disable Start menu recommendation ads.

### 🔒 4. Privacy & Telemetry Hardening
- **Diagnostic Telemetry Blocker**: Disable `AllowTelemetry`, turn off Connected User Experiences service (`DiagTrack`), and stop crash data uploads.
- **Copilot & AI Assistant Disabler**: Completely disable Windows Copilot, Start Menu Bing search results, and AI telemetry scraping.
- **Activity Feed & Keystroke Privacy**: Disable Windows Timeline activity feed, inking/typing telemetry, and advertising ID profiling.

### 🎮 5. Low-Latency Gaming Optimizer
- **MMCSS & Network Throttling Index**: Tune multimedia scheduler priorities and disable Windows network packet rate limiting.
- **Game DVR Video Buffer Off**: Stop background video capture overhead to eliminate 3-7ms input latency and micro-stutters.
- **Foreground Process Quantum**: Tune `Win32PrioritySeparation` for dedicated foreground thread responsiveness.

### 📊 6. Real-Time Hardware Telemetry
- Live CPU, RAM, Disk C:, and Network bandwidth gauges with instant updates via WebSockets.

---

## 🚀 How to Run

1. Open a terminal in this directory:
```bash
cd "C:\Users\adria\.gemini\antigravity\scratch\win-optima"
```

2. Start both the backend engine and the web application:
```bash
npm run dev
```

3. Open your browser at:
```
http://localhost:5173
```

Or simply double-click `run-win-optima.bat`.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite, WinUI 3 Fluent CSS Design System, Lucide React Icons.
- **Backend**: Node.js, Express, WebSocket (`ws`), PowerShell Execution Engine, Windows WMI / CIM APIs.
