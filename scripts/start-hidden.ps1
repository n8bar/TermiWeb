param(
  [switch]$Restart
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runDir = Join-Path $repoRoot ".termiweb\run"
$logDir = Join-Path $repoRoot ".termiweb\logs"
$pidFile = Join-Path $runDir "server.pid"
$stdoutLog = Join-Path $logDir "server.out.log"
$stderrLog = Join-Path $logDir "server.err.log"
$envFile = Join-Path $repoRoot ".env"

New-Item -ItemType Directory -Force -Path $runDir, $logDir | Out-Null

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
  $argumentList = @(
    "-NoLogo",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $scriptPath
  )
  if ($Restart) {
    $argumentList += "-Restart"
  }

  try {
    $elevatedProcess = Start-Process `
      -FilePath $powerShellExecutable `
      -ArgumentList $argumentList `
      -WorkingDirectory $repoRoot `
      -Verb RunAs `
      -Wait `
      -PassThru
    exit $elevatedProcess.ExitCode
  } catch {
    Write-Output "TermiWeb start was canceled because Windows elevation was not granted."
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

function Get-NodeExecutable {
  $bundledNode = Join-Path $repoRoot "runtime\node\node.exe"
  if (Test-Path -LiteralPath $bundledNode) {
    return $bundledNode
  }

  $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if ($nodeCommand) {
    return $nodeCommand.Source
  }

  throw "No Node runtime found. Install Node 22+ or use a packaged TermiWeb build that includes runtime\\node\\node.exe."
}

function Get-ListeningProcessId([int]$Port) {
  $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if ($listener) {
    return [int]$listener.OwningProcess
  }

  return $null
}

function Stop-ServerByPort([int]$Port) {
  $listeningPid = Get-ListeningProcessId -Port $Port
  if (-not $listeningPid) {
    return
  }

  $listeningProcess = Get-Process -Id $listeningPid -ErrorAction SilentlyContinue
  if ($listeningProcess) {
    Stop-Process -Id $listeningProcess.Id -Force
    Start-Sleep -Milliseconds 500
  }
}

function Stop-RunningServer {
  if (-not (Test-Path -LiteralPath $pidFile)) {
    return
  }

  $pidValue = (Get-Content -LiteralPath $pidFile -Raw).Trim()
  if (-not $pidValue) {
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    return
  }

  $existing = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
  if ($existing) {
    Stop-Process -Id $existing.Id -Force
    Start-Sleep -Milliseconds 500
  }

  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
}

$configuredPort = Get-ConfiguredPort

if (Test-Path -LiteralPath $pidFile) {
  if ($Restart) {
    Stop-RunningServer
    Stop-ServerByPort -Port $configuredPort
  } else {
    $pidValue = (Get-Content -LiteralPath $pidFile -Raw).Trim()
    $existing = $null
    if ($pidValue) {
      $existing = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
    }

    if ($existing) {
      throw "TermiWeb is already running with PID $($existing.Id). Use -Restart or run npm run restart:hidden."
    }

    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  }
} elseif ($Restart) {
  Stop-ServerByPort -Port $configuredPort
} else {
  $listeningPid = Get-ListeningProcessId -Port $configuredPort
  if ($listeningPid) {
    throw "A process is already listening on port $configuredPort (PID $listeningPid). Use -Restart or run npm run restart:hidden."
  }
}

$nodeExecutable = Get-NodeExecutable
$serverEntry = Join-Path $repoRoot "dist\server\server\index.js"

if (-not (Test-Path -LiteralPath $serverEntry)) {
  throw "Missing built server entrypoint at $serverEntry. Run npm run build first."
}

$process = Start-Process `
  -FilePath $nodeExecutable `
  -ArgumentList $serverEntry `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -WindowStyle Hidden `
  -PassThru

Set-Content -LiteralPath $pidFile -Value $process.Id -NoNewline
Write-Output "TermiWeb started hidden on PID $($process.Id)."
