$script:TermiWebDefaultPort = "22443"

function Read-TermiWebEnvLines {
  param(
    [string]$ConfigRoot
  )

  $envPath = Join-Path $ConfigRoot ".env"
  if (Test-Path -LiteralPath $envPath) {
    return @(Get-Content -LiteralPath $envPath)
  }

  $templatePath = Join-Path $ConfigRoot ".env.example"
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
    [string]$ConfigRoot
  )

  $port = Get-TermiWebEnvValue `
    -Lines (Read-TermiWebEnvLines -ConfigRoot $ConfigRoot) `
    -Key "TERMIWEB_PORT"
  if ([string]::IsNullOrWhiteSpace($port)) {
    return $script:TermiWebDefaultPort
  }

  return $port.Trim()
}

function Get-TermiWebAutoStartTaskName {
  param(
    [string]$ConfigRoot,
    [string]$ConfiguredPort
  )

  $port = $ConfiguredPort
  if ([string]::IsNullOrWhiteSpace($port)) {
    if ([string]::IsNullOrWhiteSpace($ConfigRoot)) {
      $port = $script:TermiWebDefaultPort
    } else {
      $port = Get-TermiWebConfiguredPort -ConfigRoot $ConfigRoot
    }
  }

  $normalizedPort = $port.Trim()
  if ($normalizedPort -eq $script:TermiWebDefaultPort) {
    return "TermiWeb Auto Start"
  }

  return "TermiWeb Auto Start ($normalizedPort)"
}

function Get-TermiWebFirewallRuleName {
  param(
    [string]$ConfiguredPort
  )

  $normalizedPort = if ([string]::IsNullOrWhiteSpace($ConfiguredPort)) {
    $script:TermiWebDefaultPort
  } else {
    $ConfiguredPort.Trim()
  }

  if ($normalizedPort -eq $script:TermiWebDefaultPort) {
    return "TermiWeb"
  }

  return "TermiWeb (port $normalizedPort)"
}
