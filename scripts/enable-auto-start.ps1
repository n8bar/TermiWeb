param(
  [switch]$Elevated,
  [string]$TargetUserName
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

function ConvertTo-PlainText([Security.SecureString]$SecureString) {
  if (-not $SecureString) {
    return ""
  }

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    if ($bstr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
  }
}

if (-not (Test-Path -LiteralPath $startScript)) {
  throw "Missing startup script at $startScript."
}

$powerShellExecutable = Get-PowerShellExecutable
$scriptPath = $MyInvocation.MyCommand.Path

if ([string]::IsNullOrWhiteSpace($TargetUserName)) {
  $TargetUserName = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
}

if (-not (Test-IsAdministrator)) {
  if ($Elevated) {
    throw "Administrator privileges are required to create the TermiWeb startup task on this machine."
  }

  $escapedTargetUserName = $TargetUserName.Replace('"', '`"')
  try {
    $elevatedProcess = Start-Process `
      -FilePath $powerShellExecutable `
      -ArgumentList "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Elevated -TargetUserName `"$escapedTargetUserName`"" `
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

$securePassword = Read-Host `
  "Enter the Windows account password for $TargetUserName so TermiWeb can start before sign-in" `
  -AsSecureString
$plainPassword = ConvertTo-PlainText $securePassword
if ([string]::IsNullOrWhiteSpace($plainPassword)) {
  Write-Output "Auto-start remains off because no Windows account password was provided for $TargetUserName."
  exit 2
}

$action = New-ScheduledTaskAction `
  -Execute $powerShellExecutable `
  -Argument "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$startScript`""
$trigger = New-ScheduledTaskTrigger -AtStartup
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
    -Settings $settings `
    -User $TargetUserName `
    -Password $plainPassword `
    -Description "Starts TermiWeb hidden at Windows startup on port $configuredPort for the installing user." `
    -RunLevel Limited `
    -Force | Out-Null
} catch {
  Write-Output "Auto-start remains off because Windows could not register the startup task for $TargetUserName."
  exit 1
}

Write-Output "Enabled TermiWeb auto-start task '$taskName' for $TargetUserName."
