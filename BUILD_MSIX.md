# Building an MSIX package for Scacchi Painter X

This document describes the Windows/MSIX packaging path for the Tauri 2 app. Tauri does not expose MSIX as a native `--bundles` target, so the project builds the Tauri executable with `--no-bundle` and packages it with `makeappx`. The resulting package is validated and left unsigned for Microsoft Store submission, where Microsoft signs it during publication.

## 1. Requirements

- Windows 11 or Windows Server 2022+ build machine
- Visual Studio 2022 Build Tools with Desktop development with C++
- Rust stable toolchain
- Node.js 20+
- pnpm
- Tauri CLI (`pnpm tauri`)
- Windows SDK/App Certification Kit (`makeappx`)
- The Store-assigned package identity and publisher subject

> Important: an unsigned EXE installer is not acceptable for Microsoft Store submission. The Store package is signed by Microsoft during publication.

## 2. Local build

From the repository root:

```powershell
cd Gui/sp-gui
pnpm install --frozen-lockfile
pnpm run build:msix
```

The script requires these environment variables:

```powershell
$env:MSIX_PACKAGE_NAME = "45001Ganori80.ScacchiPainterX"
$env:MSIX_PUBLISHER = "CN=43BE6207-BFB1-4453-A2C9-459F3D97AB2D"
$env:MSIX_DISPLAY_NAME = "<STORE_RESERVED_DISPLAY_NAME>"
```

`MSIX_PACKAGE_NAME`, `MSIX_PUBLISHER`, and `MSIX_DISPLAY_NAME` must exactly match the values assigned or reserved for the app in Partner Center. No local code-signing certificate is required when the package is distributed exclusively through Microsoft Store; Microsoft signs the package during publication.

The MSIX package is written to:

```text
Gui/sp-gui/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msix/ScacchiPainterX_0.5.1.0_x64.msix
```

## 3. Store identity requirements

The app identity must be stable and valid for Store distribution:

- Product name: the display name reserved in Partner Center
- Publisher: `CN=43BE6207-BFB1-4453-A2C9-459F3D97AB2D`
- App identity: `45001Ganori80.ScacchiPainterX`
- Package version: `0.5.1`

Use the package version in the Tauri config and the final signed package metadata. The `Identity Name` and `Publisher` in `AppxManifest.xml` must match the identity reserved for the app in Partner Center.

## 4. Optional local signing

The build script leaves the generated MSIX unsigned by default, which is the Store-only workflow. For local sideload testing, an optional certificate can be used:

```powershell
$env:CERT_THUMBPRINT = "<LOCAL_TEST_CERT_THUMBPRINT>"
```

## 5. Validation

`makeappx pack` validates the manifest while creating the package. The package can then be checked in Partner Center before submission.

## 6. Local installation for validation

The Store-upload package is unsigned locally and cannot be sideloaded directly. For local installation, set `CERT_THUMBPRINT` to a development certificate and rerun the build:

```powershell
Add-AppxPackage -Path "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\ScacchiPainterX.msix"
```

Inspect installed app packages:

```powershell
Get-AppxPackage -Name *Scacchi* | Format-List
```

## 7. Store compliance notes

This workflow resolves Microsoft Store policy 10.2.9 by delivering an MSIX/Appx package rather than exposing an installer binary directly. Microsoft signs the package during Store publication.

## 8. Troubleshooting

- If the package does not appear, ensure the correct target is installed: `rustup target add x86_64-pc-windows-msvc`
- If `makeappx` is not found, install the Windows App Certification Kit or SDK tools
- If `MSIX_PACKAGE_NAME`, `MSIX_PUBLISHER`, or `MSIX_DISPLAY_NAME` does not match the Store reservation, Partner Center will reject the package
- If the package identity is not reserved in Partner Center, the Store will reject the submission even if the MSIX is structurally valid

## 9. Store submission checklist

- Build on Windows
- Upload the unsigned MSIX to Partner Center for Microsoft signing
- Validate package structure
- Verify publisher and app identity
- Ensure architecture is x64
- Confirm no unsigned EXE installer is surfaced
- Submit the `.msix` or `.msixbundle` to the Store
