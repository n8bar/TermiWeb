$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$envPath = Join-Path $repoRoot ".env"
$packageTemplatePath = Join-Path $repoRoot ".env.example"
$repoTemplatePath = Join-Path $repoRoot ".env.dev.example"
$startLauncher = Join-Path $repoRoot "Start TermiWeb.cmd"
$enableAutoStartScript = Join-Path $repoRoot "scripts\enable-auto-start.ps1"

function Test-IsSourceCheckout {
  return (
    (Test-Path -LiteralPath (Join-Path $repoRoot ".git")) -or
    (Test-Path -LiteralPath (Join-Path $repoRoot "AGENTS.md"))
  )
}

function Get-PowerShellExecutable {
  $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
  if ($pwsh) {
    return $pwsh.Source
  }

  $windowsPowerShell = Get-Command powershell -ErrorAction SilentlyContinue
  if ($windowsPowerShell) {
    return $windowsPowerShell.Source
  }

  throw "No PowerShell host found for setup."
}

function Get-EnvTemplatePath {
  if (Test-IsSourceCheckout -and (Test-Path -LiteralPath $repoTemplatePath)) {
    return $repoTemplatePath
  }

  return $packageTemplatePath
}

function Read-EnvLines {
  if (-not (Test-Path -LiteralPath $envPath)) {
    return @()
  }

  return @(Get-Content -LiteralPath $envPath)
}

function Get-EnvValue([string[]]$Lines, [string]$Key) {
  foreach ($line in $Lines) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) {
      continue
    }

    if ($trimmed -like "$Key=*") {
      return ($trimmed -split "=", 2)[1]
    }
  }

  return $null
}

function Set-EnvValue([string]$Key, [string]$Value) {
  $lines = Read-EnvLines
  $updated = $false
  $output = foreach ($line in $lines) {
    if (-not $updated -and $line.Trim().StartsWith("$Key=")) {
      $updated = $true
      "$Key=$Value"
    } else {
      $line
    }
  }

  if (-not $updated) {
    $output += "$Key=$Value"
  }

  Set-Content -LiteralPath $envPath -Value $output -Encoding ASCII
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

function Prompt-YesNo([string]$Prompt, [bool]$DefaultYes) {
  $suffix = if ($DefaultYes) { "[Y/n]" } else { "[y/N]" }
  $response = Read-Host "$Prompt $suffix"
  if ([string]::IsNullOrWhiteSpace($response)) {
    return $DefaultYes
  }

  switch ($response.Trim().ToLowerInvariant()) {
    "y" { return $true }
    "yes" { return $true }
    "n" { return $false }
    "no" { return $false }
    default { return $DefaultYes }
  }
}

if (-not (Test-Path -LiteralPath $envPath)) {
  $templatePath = Get-EnvTemplatePath
  if (-not (Test-Path -LiteralPath $templatePath)) {
    throw "Missing environment template at $templatePath."
  }

  Copy-Item -LiteralPath $templatePath -Destination $envPath
  Write-Output "Created .env from $(Split-Path -Leaf $templatePath)."
}

$envLines = Read-EnvLines
$currentPassword = Get-EnvValue $envLines "TERMIWEB_PASSWORD"

if ([string]::IsNullOrWhiteSpace($currentPassword) -or $currentPassword -eq "change-me-first") {
  do {
    $securePassword = Read-Host "Enter the TermiWeb app password to store in .env" -AsSecureString
    $plainPassword = ConvertTo-PlainText $securePassword
  } while ([string]::IsNullOrWhiteSpace($plainPassword))

  Set-EnvValue -Key "TERMIWEB_PASSWORD" -Value $plainPassword
  Write-Output "Updated TERMIWEB_PASSWORD in .env."
}

$enableAutoStart = Prompt-YesNo `
  -Prompt "Start TermiWeb automatically before sign-in?" `
  -DefaultYes $true

if ($enableAutoStart) {
  $powerShellExecutable = Get-PowerShellExecutable
  $autoStartProcess = Start-Process `
    -FilePath $powerShellExecutable `
    -ArgumentList "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$enableAutoStartScript`"" `
    -WorkingDirectory $repoRoot `
    -Wait `
    -PassThru

  switch ($autoStartProcess.ExitCode) {
    0 {
      Write-Output "Before-sign-in auto-start is enabled."
    }
    2 {
      Write-Output "Continuing with auto-start off because the Windows authorization step was canceled."
    }
    default {
      Write-Output "Continuing with auto-start off because the startup-task setup did not complete successfully."
    }
  }
} else {
  Write-Output "Continuing with auto-start off."
}

$startNow = Prompt-YesNo -Prompt "Start TermiWeb now?" -DefaultYes $true

if (-not $startNow) {
  Write-Output "Setup complete."
  exit 0
}

if (-not (Test-Path -LiteralPath $startLauncher)) {
  throw "Missing launcher at $startLauncher."
}

Write-Output "If Windows shows a firewall prompt on first launch, allow private-network access if you want other devices on your LAN to reach TermiWeb."
cmd /c "`"$startLauncher`""

$port = Get-EnvValue (Read-EnvLines) "TERMIWEB_PORT"
if ([string]::IsNullOrWhiteSpace($port)) {
  $port = "22443"
}

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:$port"
Write-Output "Setup complete."
