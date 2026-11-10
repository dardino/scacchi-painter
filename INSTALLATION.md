# Installation and deployment guide

This guide explains how to install, validate, and deploy Scacchi Painter X as a Microsoft Store-compliant MSIX package.

## 1. Prerequisites

- Windows 11 or Windows Server 2022+
- Rust stable
- Node.js 20+
- pnpm
- Tauri CLI
- Windows SDK (`signtool`, `makeappx`)
- Microsoft-compatible signing certificate

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

## 3. Build the package

```powershell
cd Gui/sp-gui
pnpm tauri build --target x86_64-pc-windows-msvc --bundles app
```

Alternative script:

```powershell
cd Gui/sp-gui
pnpm run build:tauri:store
```

## 4. Sign the package

```powershell
$thumbprint = "<CERT_THUMBPRINT>"
$packagePath = "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\ScacchiPainterX.msix"

signtool sign /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /sha1 $thumbprint $packagePath
```

## 5. Install the package locally

```powershell
Add-AppxPackage -Path $packagePath
```

## 6. Validate installation

```powershell
Get-AppxPackage -Name *Scacchi* | Format-List
```

## 7. Validate the package

```powershell
signtool verify /pa $packagePath
makeappx validate $packagePath
```

## 8. Deployment routes

### Microsoft Store

Use the signed MSIX package in the Store submission pipeline.

### Winget

```powershell
winget install --id Ganori.ScacchiPainterX --source winget
```

### Intune

Import the signed MSIX package to Intune and assign it to the target device group.

### DISM

```powershell
dism /Online /Add-ProvisionedAppxPackage /PackagePath:$packagePath /SkipLicense
```

## 9. Notes about Store compliance

This is not an unsigned `.exe` installer. It is a signed, Store-compliant MSIX package that follows the supported package identity and versioning model required by Microsoft Store policy.

## 10. Common issues

- `rustup target add x86_64-pc-windows-msvc` is required before building a Windows x64 package.
- `signtool` must be available from the Windows SDK.
- `makeappx` must be installed from the Windows SDK or App Certification Kit tools.
- If the package is not installed, ensure the certificate chain is valid and the app identity is not already in use by another package.
