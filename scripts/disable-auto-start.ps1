param(
  [switch]$Elevated
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$commonScript = Join-Path $PSScriptRoot "auto-start-common.ps1"
$taskName = "TermiWeb Auto Start"

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

  throw "No PowerShell host found for scheduled startup removal."
}

function Test-IsAdministrator {
  $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object System.Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

$powerShellExecutable = Get-PowerShellExecutable
$scriptPath = $MyInvocation.MyCommand.Path
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if (-not $existingTask) {
  Write-Output "No TermiWeb auto-start task found for this copy."
  exit 0
}

if (-not (Test-IsAdministrator)) {
  if ($Elevated) {
    throw "Administrator privileges are required to remove the TermiWeb startup task on this machine."
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
    Write-Output "Auto-start removal was canceled at the Windows elevation step."
    exit 2
  }
}

$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if (-not $existingTask) {
  Write-Output "No TermiWeb auto-start task found for this copy."
  exit 0
}

try {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction Stop
} catch {
  Write-Output "Could not remove the TermiWeb auto-start task '$taskName'."
  exit 1
}

Write-Output "Removed TermiWeb auto-start task '$taskName'."
