$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pidFile = Join-Path $repoRoot ".termiweb\run\server.pid"
$envFile = Join-Path $repoRoot ".env"

$ErrorActionPreference = "Stop"

function Get-PowerShellExecutable {
  $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
  if ($pwsh) {
    return $pwsh.Source
  }

  $windowsPowerShell = Get-Command powershell -ErrorAction SilentlyContinue
  if ($windowsPowerShell) {
    return $windowsPowerShell.Source
  }

  throw "No PowerShell host found for elevation."
}

function Test-IsAdministrator {
  $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object System.Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdministrator)) {
  $powerShellExecutable = Get-PowerShellExecutable
  $scriptPath = $MyInvocation.MyCommand.Path

  try {
    $elevatedProcess = Start-Process `
      -FilePath $powerShellExecutable `
      -ArgumentList @(
        "-NoLogo",
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $scriptPath
      ) `
      -WorkingDirectory $repoRoot `
      -Verb RunAs `
      -Wait `
      -PassThru
    exit $elevatedProcess.ExitCode
  } catch {
    Write-Output "TermiWeb stop was canceled because Windows elevation was not granted."
    exit 2
  }
}

function Get-ConfiguredPort {
  if (Test-Path -LiteralPath $envFile) {
    foreach ($line in Get-Content -LiteralPath $envFile) {
      $trimmed = $line.Trim()
      if (-not $trimmed -or $trimmed.StartsWith("#")) {
        continue
      }

      if ($trimmed -like "TERMIWEB_PORT=*") {
        return [int](($trimmed -split "=", 2)[1].Trim())
      }
    }
  }

  if ($env:TERMIWEB_PORT) {
    return [int]$env:TERMIWEB_PORT
  }

  return 22443
}

function Stop-ServerByPort([int]$Port) {
  $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if (-not $listener) {
    return $false
  }

  $existing = Get-Process -Id ([int]$listener.OwningProcess) -ErrorAction SilentlyContinue
  if ($existing) {
    Stop-Process -Id $existing.Id -Force
    return $true
  }

  return $false
}

if (-not (Test-Path -LiteralPath $pidFile)) {
  $stoppedByPort = Stop-ServerByPort -Port (Get-ConfiguredPort)
  if ($stoppedByPort) {
    Write-Output "Stopped hidden TermiWeb server by listening port."
  } else {
    Write-Output "No hidden TermiWeb server PID file found."
  }
  exit 0
}

$pidValue = (Get-Content -LiteralPath $pidFile -Raw).Trim()
if (-not $pidValue) {
  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  Write-Output "Removed empty TermiWeb PID file."
  exit 0
}

$existing = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
if ($existing) {
  Stop-Process -Id $existing.Id -Force
  Write-Output "Stopped hidden TermiWeb server PID $($existing.Id)."
} else {
  Write-Output "No running TermiWeb server found for PID $pidValue."
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
