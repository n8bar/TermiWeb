$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$stopScript = Join-Path $repoRoot "scripts\stop-hidden.ps1"
$disableAutoStartScript = Join-Path $repoRoot "scripts\disable-auto-start.ps1"

function Test-IsSourceCheckout {
  return (
    (Test-Path -LiteralPath (Join-Path $repoRoot ".git")) -or
    (Test-Path -LiteralPath (Join-Path $repoRoot "src")) -or
    (Test-Path -LiteralPath (Join-Path $repoRoot "tests")) -or
    (Test-Path -LiteralPath (Join-Path $repoRoot "AGENTS.md"))
  )
}

if (Test-IsSourceCheckout) {
  throw "Refusing to uninstall from a source checkout. Use this only from a packaged TermiWeb release."
}

if (-not (Test-Path -LiteralPath $stopScript)) {
  throw "Missing stop script at $stopScript."
}

if (-not (Test-Path -LiteralPath $disableAutoStartScript)) {
  throw "Missing auto-start removal script at $disableAutoStartScript."
}

& $stopScript | Out-Null
& $disableAutoStartScript | Out-Null

$cleanupScriptPath = Join-Path $env:TEMP ("termiweb-uninstall-" + [guid]::NewGuid().ToString() + ".cmd")
$escapedRoot = $repoRoot.Replace('"', '""')
$cleanupScript = @"
@echo off
ping 127.0.0.1 -n 3 >nul
rmdir /s /q "$escapedRoot"
del "%~f0"
"@

Set-Content -LiteralPath $cleanupScriptPath -Value $cleanupScript -Encoding ASCII
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$cleanupScriptPath`"" -WindowStyle Hidden

Write-Output "TermiWeb uninstall started. This package directory will remove itself after the script exits."
