param(
  [switch]$Elevated
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$commonScript = Join-Path $PSScriptRoot "auto-start-common.ps1"
$startScript = Join-Path $repoRoot "scripts\start-hidden.ps1"

if (-not (Test-Path -LiteralPath $commonScript)) {
  throw "Missing auto-start helper script at $commonScript."
}

. $commonScript

$configuredPort = Get-TermiWebConfiguredPort -RepoRoot $repoRoot
$taskName = Get-TermiWebAutoStartTaskName -ConfiguredPort $configuredPort

function Get-PowerShellExecutable {
  $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
  if ($pwsh) {
    return $pwsh.Source
  }

  $windowsPowerShell = Get-Command powershell -ErrorAction SilentlyContinue
  if ($windowsPowerShell) {
    return $windowsPowerShell.Source
  }

  throw "No PowerShell host found for scheduled startup."
}

function Test-IsAdministrator {
  $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object System.Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Path -LiteralPath $startScript)) {
  throw "Missing startup script at $startScript."
}

$powerShellExecutable = Get-PowerShellExecutable
$scriptPath = $MyInvocation.MyCommand.Path

if (-not (Test-IsAdministrator)) {
  if ($Elevated) {
    throw "Administrator privileges are required to create the TermiWeb startup task on this machine."
  }

  try {
    $elevatedProcess = Start-Process `
      -FilePath $powerShellExecutable `
      -ArgumentList "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Elevated" `
      -WorkingDirectory $repoRoot `
      -Verb RunAs `
      -Wait `
      -PassThru
    exit $elevatedProcess.ExitCode
  } catch {
    Write-Output "Auto-start remains off because Windows elevation was canceled."
    exit 2
  }
}

# The task runs as the built-in SYSTEM account. SYSTEM exists on every machine,
# is already running before anyone signs in, and has no password to collect or
# validate, so registration succeeds on Hello-only and PIN-only sign-in setups
# where a password-based task cannot be registered at all.
$action = New-ScheduledTaskAction `
  -Execute $powerShellExecutable `
  -Argument "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$startScript`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$taskPrincipal = New-ScheduledTaskPrincipal `
  -UserId "NT AUTHORITY\SYSTEM" `
  -LogonType ServiceAccount `
  -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
try {
  Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $taskPrincipal `
    -Settings $settings `
    -Description "Starts TermiWeb hidden at Windows startup on port $configuredPort as SYSTEM, before anyone signs in." `
    -Force | Out-Null
} catch {
  Write-Output "Auto-start remains off because Windows could not register the startup task."
  exit 1
}

Write-Output "Enabled TermiWeb auto-start task '$taskName'. It runs as SYSTEM before sign-in; no Windows account password is stored."
