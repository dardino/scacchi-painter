# Microsoft Store submission guide for Scacchi Painter X

This package is intended for Microsoft Store distribution and follows a Store-compliant packaging path. The app is delivered as an MSIX/Appx package rather than a loose unsigned `.exe` installer. Microsoft signs the package during publication.

## 1. Why this resolves policy 10.2.9

Microsoft Store policy 10.2.9 rejects Store submissions that expose an installer or executable outside a managed package. The MSIX workflow wraps the app and required runtime files in a package with a valid identity, version, and publisher metadata.

## 2. Product identity

The configured identity is:

- Product: the display name reserved in Partner Center
- Publisher: `CN=43BE6207-BFB1-4453-A2C9-459F3D97AB2D`
- App ID: `45001Ganori80.ScacchiPainterX`
- Version: `0.6.0`
- Architecture: `x64`

These values must remain stable in the Store submission and in the generated package.

## 3. Required build outputs

Build the MSIX package from the repository root:

```powershell
cd Gui/sp-gui
pnpm install --frozen-lockfile
$env:MSIX_PUBLISHER = "CN=43BE6207-BFB1-4453-A2C9-459F3D97AB2D"
$env:MSIX_PACKAGE_NAME = "45001Ganori80.ScacchiPainterX"
$env:MSIX_DISPLAY_NAME = "<STORE_RESERVED_DISPLAY_NAME>"
pnpm run build:msix
```

The MSIX output to upload to Partner Center is:

```text
Gui/sp-gui/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msix/ScacchiPainterX_0.6.0.0_x64.msix
```

## 4. Package compliance checklist

- The package identity and publisher match the Store reservation
- Package version is in the required format and increments correctly
- Publisher identity matches the store account and package identity
- App architecture is x64
- Files are contained within an MSIX package, not side-loaded as standalone executables
- No unsigned EXE installer is distributed as the primary artifact
- AppData, settings, and local state remain within the user app sandbox under Store rules

## 5. Validation commands

```powershell
Get-AppxPackage -Name *Scacchi* | Format-List
```

## 6. Deployment methods supported by the package

The package can be installed or managed through:

- Microsoft Store
- Winget
- Intune
- `Add-AppxPackage`
- DISM

## 7. Store submission process summary

1. Build the Windows x64 MSIX package.
2. Validate the package with `makeappx`.
3. Upload the package to the Microsoft Store submission flow.
4. Confirm the package identity, version, and metadata match the Store account.
5. Submit for review.

## 8. Known compatibility guardrails

The app must avoid the following in Store mode:

- writes to `Program Files`
- custom self-updating executables
- service installation
- shell extensions
- driver installation
- registry writes outside approved package-managed scopes

This project is designed to use app-local resources, such as the bundled Popeye runtime under the app package, and user app data paths instead of machine-wide installation paths.

## 9. Final readiness statement

The repository is configured to use Tauri 2-compatible Windows packaging conventions and to target an MSIX output instead of an unsigned Windows installer. Microsoft performs the final signing during Store publication.
