# Installation and deployment guide

This guide explains how to install, validate, and deploy Scacchi Painter X as a Microsoft Store-compliant MSIX package.

## 1. Prerequisites

- Windows 11 or Windows Server 2022+
- Rust stable
- Node.js 20+
- pnpm
- Tauri CLI
- Windows SDK/App Certification Kit (`makeappx`)

## 2. Install dependencies

```powershell
winget install --id OpenJS.NodeJS.LTS -e
winget install --id RustLang.Rustup -e
rustup default stable
```

Then from the repo root:

```powershell
cd Gui/sp-gui
pnpm install --frozen-lockfile
rustup target add x86_64-pc-windows-msvc
```

## 3. Build the MSIX package

```powershell
cd Gui/sp-gui
$env:MSIX_PUBLISHER = "CN=43BE6207-BFB1-4453-A2C9-459F3D97AB2D"
$env:MSIX_PACKAGE_NAME = "45001Ganori80.ScacchiPainterX"
$env:MSIX_DISPLAY_NAME = "<STORE_RESERVED_DISPLAY_NAME>"
pnpm run build:msix
```

The generated unsigned package is suitable for upload to Microsoft Store, which signs it during publication:

```text
Gui/sp-gui/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msix/ScacchiPainterX_0.6.0.0_x64.msix
```

## 4. Install the package locally

```powershell
$packagePath = "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\msix\ScacchiPainterX_0.6.0.0_x64.msix"
Add-AppxPackage -Path $packagePath
```

## 5. Validate installation

```powershell
Get-AppxPackage -Name *Scacchi* | Format-List
```

## 8. Deployment routes

### Microsoft Store

Use the MSIX package in the Store submission pipeline; Microsoft signs it during publication.

### Winget

```powershell
winget install --id Ganori.ScacchiPainterX --source winget
```

### Intune

Import a separately signed MSIX package to Intune and assign it to the target device group.

### DISM

```powershell
dism /Online /Add-ProvisionedAppxPackage /PackagePath:$packagePath /SkipLicense
```

## 9. Notes about Store compliance

This is not an unsigned `.exe` installer. It is an MSIX package that follows the supported package identity and versioning model required by Microsoft Store policy.

## 10. Common issues

- `rustup target add x86_64-pc-windows-msvc` is required before building a Windows x64 package.
- `makeappx` must be installed from the Windows SDK or App Certification Kit tools.
- An unsigned Store package cannot be sideloaded locally; use an optional development certificate for local installation.
