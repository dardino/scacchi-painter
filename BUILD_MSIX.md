# Building an MSIX package for Scacchi Painter X

This document describes the Windows/MSIX packaging path for the Tauri 2 app. The goal is to avoid the non-compliant unsigned `.exe` installer path and produce a Microsoft Store-ready package instead.

## 1. Requirements

- Windows 11 or Windows Server 2022+ build machine
- Visual Studio 2022 Build Tools with Desktop development with C++
- Rust stable toolchain
- Node.js 20+
- pnpm
- Tauri CLI (`pnpm tauri`)
- Windows SDK and signing tools (`signtool`, `makeappx`)
- A valid Microsoft signing certificate, a timestamp service, and a Store submission identity

> Important: an unsigned EXE installer is not acceptable for Microsoft Store submission. The Store-compliant distribution path is a signed MSIX/Appx package.

## 2. Local build

From the repository root:

```powershell
cd Gui/sp-gui
pnpm install --frozen-lockfile
pnpm tauri build --target x86_64-pc-windows-msvc --bundles app
```

If you prefer the project script:

```powershell
cd Gui/sp-gui
pnpm run build:tauri:store
```

The package output should appear under:

```text
Gui/sp-gui/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/
```

Expected artifact forms:

- `.msix`
- `.appx`
- `.msixbundle`

## 3. Store identity requirements

The app identity must be stable and valid for Store distribution:

- Product name: `Scacchi Painter X`
- Publisher: `Ganori`
- App identity: `Ganori.ScacchiPainterX`
- Package version: `0.5.0`

Use the package version in the Tauri config and the final signed package metadata.

## 4. Signing

Before submitting to Store or validating with `signtool`, install a valid code-signing certificate and ensure the certificate thumbprint is available in the environment.

Example:

```powershell
$thumbprint = "<CERT_THUMBPRINT>"
Set-Location "Gui/sp-gui"

signtool sign /fd SHA256 /td SHA256 /tr http://timestamp.digicert.com /sha1 $thumbprint "src-tauri/target/x86_64-pc-windows-msvc/release/bundle/*.msix"
```

If using an external signing service, replace the timestamp URL accordingly.

## 5. Validation

Verify the package signature:

```powershell
signtool verify /pa "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\ScacchiPainterX.msix"
```

Validate the package structure:

```powershell
makeappx validate "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\ScacchiPainterX.msix"
```

## 6. Local installation for validation

Install the signed package:

```powershell
Add-AppxPackage -Path "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\ScacchiPainterX.msix"
```

Inspect installed app packages:

```powershell
Get-AppxPackage -Name *Scacchi* | Format-List
```

## 7. Store compliance notes

This workflow resolves Microsoft Store policy 10.2.9 by delivering a signed MSIX/Appx package rather than exposing an unsigned installer binary directly. The package is signed, versioned, packaged, and managed under the app’s Store identity.

## 8. Troubleshooting

- If the package does not appear, ensure the correct target is installed: `rustup target add x86_64-pc-windows-msvc`
- If `signtool` is not found, install the Windows SDK
- If `makeappx` is not found, install the Windows App Certification Kit or SDK tools
- If `tauri build` emits no `.msix`, verify that the build is running on a Windows host and that the bundle target is configured correctly

## 9. Store submission checklist

- Build on Windows
- Sign using an approved certificate
- Validate package structure
- Verify publisher and app identity
- Ensure architecture is x64
- Confirm no unsigned EXE installer is surfaced
- Submit the signed `.msix` or `.msixbundle` to the Store
