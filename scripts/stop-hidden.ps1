$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pidFile = Join-Path $repoRoot ".termiweb\run\server.pid"
$envFile = Join-Path $repoRoot ".env"

$ErrorActionPreference = "Stop"

function Get-ConfiguredPort {
  if ($env:TERMIWEB_PORT) {
    return [int]$env:TERMIWEB_PORT
  }

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
