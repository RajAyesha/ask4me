param(
  [string]$Version = "latest",
  [string]$Repo = "easychen/ask4me",
  [string]$InstallDir = ""
)

$archRaw = $env:PROCESSOR_ARCHITECTURE
try {
  $archRaw = [System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture.ToString()
} catch {}

$arch = ""
switch -Regex ($archRaw) {
  "^(AMD64|X64|x64)$" { $arch = "amd64"; break }
  "^(ARM64|Arm64|arm64)$" { $arch = "arm64"; break }
  default { throw "unsupported arch: $archRaw" }
}

$asset = "ask4me-windows-$arch.exe"

$tagPath = ""
if ($Version -eq "latest") {
  $tagPath = "releases/latest/download"
} elseif ($Version.StartsWith("v")) {
  $tagPath = "releases/download/$Version"
} else {
  $tagPath = "releases/download/v$Version"
}

$baseUrl = "https://github.com/$Repo/$tagPath"
$url = "$baseUrl/$asset"

if ([string]::IsNullOrWhiteSpace($InstallDir)) {
  $InstallDir = Join-Path $env:LOCALAPPDATA "ask4me\bin"
}

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("ask4me-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

try {
  $binPath = Join-Path $tmpDir $asset
  Invoke-WebRequest -Uri $url -OutFile $binPath -UseBasicParsing

  $checksumsPath = Join-Path $tmpDir "checksums.txt"
  $checksumsOk = $false
  try {
    Invoke-WebRequest -Uri "$baseUrl/checksums.txt" -OutFile $checksumsPath -UseBasicParsing
    $checksumsOk = $true
  } catch {}

  if ($checksumsOk) {
    $expected = $null
    foreach ($line in Get-Content -Path $checksumsPath) {
      if ($line -match "\s+$([regex]::Escape($asset))$") {
        $expected = ($line -split "\s+")[0]
        break
      }
    }
    if (-not [string]::IsNullOrWhiteSpace($expected)) {
      $got = (Get-FileHash -Path $binPath -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($got -ne $expected.ToLowerInvariant()) {
        throw "sha256 mismatch: expected $expected got $got"
      }
    }
  }

  $target = Join-Path $InstallDir "ask4me.exe"
  Copy-Item -Path $binPath -Destination $target -Force
  Write-Output "installed: $target"
  Write-Output "ensure PATH includes: $InstallDir"
} finally {
  Remove-Item -Recurse -Force -Path $tmpDir -ErrorAction SilentlyContinue | Out-Null
}
