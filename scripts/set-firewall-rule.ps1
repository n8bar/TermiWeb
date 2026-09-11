param(
  [switch]$Remove,
  [switch]$Elevated
)

$ErrorActionPreference = "Stop"

$layoutScript = Join-Path $PSScriptRoot "layout-common.ps1"
$commonScript = Join-Path $PSScriptRoot "auto-start-common.ps1"

foreach ($helper in @($layoutScript, $commonScript)) {
  if (-not (Test-Path -LiteralPath $helper)) {
    throw "Missing helper script at $helper."
  }
}

. $layoutScript
. $commonScript

$repoRoot = Get-TermiWebAppRoot -ScriptRoot $PSScriptRoot
$configRoot = Get-TermiWebConfigRoot -AppRoot $repoRoot
$configuredPort = Get-TermiWebConfiguredPort -ConfigRoot $configRoot
$ruleName = Get-TermiWebFirewallRuleName -ConfiguredPort $configuredPort

function Get-PowerShellExecutable {
  $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
  if ($pwsh) {
    return $pwsh.Source
  }

  $windowsPowerShell = Get-Command powershell -ErrorAction SilentlyContinue
  if ($windowsPowerShell) {
    return $windowsPowerShell.Source
  }

  throw "No PowerShell host found for the firewall rule change."
}

function Test-IsAdministrator {
  $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object System.Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdministrator)) {
  if ($Elevated) {
    throw "Administrator privileges are required to change the TermiWeb firewall rule."
  }

  $arguments = "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`" -Elevated"
  if ($Remove) {
    $arguments += " -Remove"
  }

  try {
    $elevatedProcess = Start-Process `
      -FilePath (Get-PowerShellExecutable) `
      -ArgumentList $arguments `
      -WorkingDirectory $repoRoot `
      -Verb RunAs `
      -Wait `
      -PassThru
    exit $elevatedProcess.ExitCode
  } catch {
    Write-Output "The firewall rule was left unchanged because Windows elevation was canceled."
    exit 2
  }
}

$existingRules = @(Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)
foreach ($rule in $existingRules) {
  Remove-NetFirewallRule -Name $rule.Name -ErrorAction Stop
}

if ($Remove) {
  if ($existingRules.Count -gt 0) {
    Write-Output "Removed the firewall rule '$ruleName'."
  } else {
    Write-Output "No firewall rule named '$ruleName' was present."
  }
  exit 0
}

try {
  New-NetFirewallRule `
    -DisplayName $ruleName `
    -Description "Allows devices on the local network to reach TermiWeb on TCP port $configuredPort." `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $configuredPort `
    -Profile Any `
    -ErrorAction Stop | Out-Null
} catch {
  Write-Output "Windows could not create the firewall rule '$ruleName'."
  exit 1
}

Write-Output "Allowed inbound TCP port $configuredPort on every network profile through the firewall rule '$ruleName'."
