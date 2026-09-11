param(
  [switch]$Restart,
  [switch]$WaitForPort
)

$ErrorActionPreference = "Stop"

$layoutScript = Join-Path $PSScriptRoot "layout-common.ps1"
if (-not (Test-Path -LiteralPath $layoutScript)) {
  throw "Missing helper script at $layoutScript."
}

. $layoutScript

# The app root holds the binaries; the config root holds .env and the data
# directory. They are the same folder for the portable layout and differ for
# the installed layout, where the server runs with the config root as its
# working directory so config and state resolve there.
$repoRoot = Get-TermiWebAppRoot -ScriptRoot $PSScriptRoot
$configRoot = Get-TermiWebConfigRoot -AppRoot $repoRoot
$runDir = Join-Path $configRoot ".termiweb\run"
$logDir = Join-Path $configRoot ".termiweb\logs"
$pidFile = Join-Path $runDir "server.pid"
$stdoutLog = Join-Path $logDir "server.out.log"
$stderrLog = Join-Path $logDir "server.err.log"
$envFile = Join-Path $configRoot ".env"

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
    "`"$scriptPath`""
  )
  if ($Restart) {
    $argumentList += "-Restart"
  }
  if ($WaitForPort) {
    $argumentList += "-WaitForPort"
  }

  try {
    $elevatedProcess = Start-Process `
      -FilePath $powerShellExecutable `
      -ArgumentList $argumentList `
      -WorkingDirectory $repoRoot `
      -Verb RunAs `
      -WindowStyle Hidden `
      -Wait `
      -PassThru
    exit $elevatedProcess.ExitCode
  } catch {
    Write-Output "TermiWeb start was canceled because Windows elevation was not granted."
    exit 2
  }
}

New-Item -ItemType Directory -Force -Path $runDir, $logDir | Out-Null

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

  # A pid file can outlive its server (after a reboot, for example) and the id
  # can belong to an unrelated process by now, so only a Node process is stopped.
  $existing = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
  if ($existing -and $existing.ProcessName -eq "node") {
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

    if ($existing -and $existing.ProcessName -eq "node") {
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

# Quoted because an installed copy lives under Program Files, whose path has a space.
$process = Start-Process `
  -FilePath $nodeExecutable `
  -ArgumentList "`"$serverEntry`"" `
  -WorkingDirectory $configRoot `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -WindowStyle Hidden `
  -PassThru

Set-Content -LiteralPath $pidFile -Value $process.Id -NoNewline
Write-Output "TermiWeb started hidden on PID $($process.Id)."

if ($WaitForPort) {
  $deadline = (Get-Date).AddSeconds(20)
  while ((Get-Date) -lt $deadline) {
    if (Get-ListeningProcessId -Port $configuredPort) {
      Write-Output "TermiWeb is listening on port $configuredPort."
      exit 0
    }

    if ($process.HasExited) {
      Write-Output "TermiWeb exited before it started listening. See $stderrLog."
      exit 1
    }

    Start-Sleep -Milliseconds 500
  }

  Write-Output "TermiWeb has not started listening on port $configuredPort yet. See $stderrLog if it never does."
  exit 1
}
