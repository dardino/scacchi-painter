$ErrorActionPreference = 'Stop'

function Require-Command([string] $Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name was not found. Install the Windows SDK/App Certification Kit and add it to PATH."
    }
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$tauriRoot = Join-Path $projectRoot 'src-tauri'
$targetRoot = Join-Path $tauriRoot 'target\x86_64-pc-windows-msvc'
$releaseRoot = Join-Path $targetRoot 'release'
$stagingRoot = Join-Path $targetRoot 'msix\package'
$bundleRoot = Join-Path $releaseRoot 'bundle\msix'
$exeName = 'scacchi-painter-x.exe'
$exePath = Join-Path $releaseRoot $exeName
$version = '0.6.0.0'
$packageName = $env:MSIX_PACKAGE_NAME
$publisher = $env:MSIX_PUBLISHER
$displayName = $env:MSIX_DISPLAY_NAME
$certificateThumbprint = $env:CERT_THUMBPRINT

if (-not $packageName) {
    throw 'MSIX_PACKAGE_NAME is required and must exactly match the package identity reserved in Partner Center.'
}
if (-not $publisher) {
    throw 'MSIX_PUBLISHER is required and must exactly match the Publisher identity assigned by Partner Center.'
}
if (-not $displayName) {
    throw 'MSIX_DISPLAY_NAME is required and must exactly match the display name reserved in Partner Center.'
}

Require-Command 'makeappx'

Write-Host 'Building the Tauri Windows executable...'
Push-Location $projectRoot
try {
    & pnpm tauri build --target x86_64-pc-windows-msvc --no-bundle
    if ($LASTEXITCODE -ne 0) {
        throw 'Tauri x64 Windows executable build failed.'
    }
}
finally {
    Pop-Location
}

if (-not (Test-Path $exePath)) {
    throw "Tauri executable was not created at $exePath"
}

if (Test-Path $stagingRoot) {
    Remove-Item -Path $stagingRoot -Recurse -Force
}
New-Item -Path $stagingRoot -ItemType Directory -Force | Out-Null
New-Item -Path (Join-Path $stagingRoot 'Assets') -ItemType Directory -Force | Out-Null
New-Item -Path (Join-Path $stagingRoot 'resources\popeye') -ItemType Directory -Force | Out-Null

Copy-Item -Path $exePath -Destination (Join-Path $stagingRoot $exeName)
Copy-Item -Path (Join-Path $tauriRoot 'icons\Square44x44Logo.png') -Destination (Join-Path $stagingRoot 'Assets\Square44x44Logo.png')
Copy-Item -Path (Join-Path $tauriRoot 'icons\Square150x150Logo.png') -Destination (Join-Path $stagingRoot 'Assets\Square150x150Logo.png')
Copy-Item -Path (Join-Path $tauriRoot 'icons\StoreLogo.png') -Destination (Join-Path $stagingRoot 'Assets\StoreLogo.png')
Copy-Item -Path (Join-Path $tauriRoot 'popeye\pywin64.exe') -Destination (Join-Path $stagingRoot 'resources\popeye\pywin64.exe')

$webViewLoader = Join-Path $releaseRoot 'WebView2Loader.dll'
if (Test-Path $webViewLoader) {
    Copy-Item -Path $webViewLoader -Destination (Join-Path $stagingRoot 'WebView2Loader.dll')
}

$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
         xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
         IgnorableNamespaces="uap rescap">
  <Identity Name="$packageName" Publisher="$publisher" Version="$version" ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>$displayName</DisplayName>
    <PublisherDisplayName>Ganori</PublisherDisplayName>
    <Description>$displayName chess composition and analysis workspace.</Description>
    <Logo>Assets\StoreLogo.png</Logo>
  </Properties>
  <Resources>
    <Resource Language="en-us" />
  </Resources>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.26100.0" />
  </Dependencies>
  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
  <Applications>
    <Application Id="App" Executable="$exeName" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements AppListEntry="default"
                          DisplayName="$displayName"
                          Description="$displayName chess composition and analysis workspace."
                          BackgroundColor="#000000"
                          Square44x44Logo="Assets\Square44x44Logo.png"
                          Square150x150Logo="Assets\Square150x150Logo.png" />
    </Application>
  </Applications>
</Package>
"@

Set-Content -Path (Join-Path $stagingRoot 'AppxManifest.xml') -Value $manifest -Encoding utf8

New-Item -Path $bundleRoot -ItemType Directory -Force | Out-Null
$msixPath = Join-Path $bundleRoot 'ScacchiPainterX_0.6.0.0_x64.msix'
if (Test-Path $msixPath) {
    Remove-Item -Path $msixPath -Force
}

& makeappx pack /d $stagingRoot /p $msixPath /o
if ($LASTEXITCODE -ne 0) {
    throw "MSIX packaging failed: $msixPath"
}

if ($certificateThumbprint) {
    Require-Command 'signtool'
    & signtool sign /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /sha1 $certificateThumbprint $msixPath
    if ($LASTEXITCODE -ne 0) {
        throw "MSIX signing failed: $msixPath"
    }
    Write-Host 'MSIX signed locally. Microsoft will re-sign the package during Store publication.'
} else {
    Write-Host 'MSIX left unsigned for Microsoft Store submission. Microsoft will sign it during publication.'
}

Write-Host "MSIX package created and manifest validated during packing: $msixPath"
