$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$bundleRoot = Join-Path $projectRoot 'src-tauri/target/x86_64-pc-windows-msvc/release/bundle'

Write-Host 'Building the Windows x64 Tauri app bundle for Store-compatible packaging...'
& pnpm tauri build --target x86_64-pc-windows-msvc --bundles app
if ($LASTEXITCODE -ne 0) {
    throw 'Tauri x64 Windows bundle build failed.'
}

if (-not (Test-Path $bundleRoot)) {
    throw "Bundle output was not created at $bundleRoot"
}

$packages = Get-ChildItem -Path $bundleRoot -Recurse -File | Where-Object {
    $_.Extension -in '.msix', '.appx', '.msixbundle'
}

if ($packages.Count -eq 0) {
    Write-Warning 'No MSIX/Appx files were produced. Verify the Windows build host and Tauri bundle configuration.'
    exit 0
}

foreach ($package in $packages) {
    Write-Host "Package produced: $($package.FullName)"
}

$thumbprint = $env:CERT_THUMBPRINT
if ($thumbprint) {
    foreach ($package in $packages) {
        & signtool sign /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /sha1 $thumbprint $package.FullName
        if ($LASTEXITCODE -ne 0) {
            throw "Signing failed for $($package.FullName)"
        }
    }
} else {
    Write-Host 'CERT_THUMBPRINT is not set. Package was built but not signed. Set it before Store submission.'
}

Write-Host 'Store-ready package build complete. Validate using signtool verify and makeappx validate.'
