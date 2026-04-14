$script:TermiWebDefaultPort = "22443"

function Read-TermiWebEnvLines {
  param(
    [string]$RepoRoot
  )

  $envPath = Join-Path $RepoRoot ".env"
  if (Test-Path -LiteralPath $envPath) {
    return @(Get-Content -LiteralPath $envPath)
  }

  $templatePath = Join-Path $RepoRoot ".env.example"
  if (Test-Path -LiteralPath $templatePath) {
    return @(Get-Content -LiteralPath $templatePath)
  }

  return @()
}

function Get-TermiWebEnvValue {
  param(
    [string[]]$Lines,
    [string]$Key
  )

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

function Get-TermiWebConfiguredPort {
  param(
    [string]$RepoRoot
  )

  $port = Get-TermiWebEnvValue `
    -Lines (Read-TermiWebEnvLines -RepoRoot $RepoRoot) `
    -Key "TERMIWEB_PORT"
  if ([string]::IsNullOrWhiteSpace($port)) {
    return $script:TermiWebDefaultPort
  }

  return $port.Trim()
}

function Get-TermiWebAutoStartTaskName {
  param(
    [string]$RepoRoot,
    [string]$ConfiguredPort
  )

  $port = $ConfiguredPort
  if ([string]::IsNullOrWhiteSpace($port)) {
    if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
      $port = $script:TermiWebDefaultPort
    } else {
      $port = Get-TermiWebConfiguredPort -RepoRoot $RepoRoot
    }
  }

  $normalizedPort = $port.Trim()
  if ($normalizedPort -eq $script:TermiWebDefaultPort) {
    return "TermiWeb Auto Start"
  }

  return "TermiWeb Auto Start ($normalizedPort)"
}
