# Resolves where this TermiWeb copy keeps its binaries versus its config and
# state. In the portable layout both are the package folder. In the installed
# layout the installer writes install-layout.json beside the binaries, naming
# the config root (the ProgramData directory) where .env and the data directory
# live, so nothing at runtime writes under Program Files.

function Get-TermiWebAppRoot {
  param(
    [string]$ScriptRoot
  )

  return (Resolve-Path (Join-Path $ScriptRoot "..")).Path
}

function Get-TermiWebConfigRoot {
  param(
    [string]$AppRoot
  )

  $layoutFile = Join-Path $AppRoot "install-layout.json"
  if (-not (Test-Path -LiteralPath $layoutFile)) {
    return $AppRoot
  }

  try {
    $layout = Get-Content -LiteralPath $layoutFile -Raw | ConvertFrom-Json
  } catch {
    throw "Could not read the install layout file at $layoutFile."
  }

  if ([string]::IsNullOrWhiteSpace($layout.configRoot)) {
    throw "The install layout file at $layoutFile does not name a config root."
  }

  return [Environment]::ExpandEnvironmentVariables([string]$layout.configRoot)
}
