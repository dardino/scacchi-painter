# Microsoft Store submission guide for Scacchi Painter X

This package is intended for Microsoft Store distribution and follows a Store-compliant packaging path. The app is delivered as a signed MSIX/Appx package rather than a loose unsigned `.exe` installer.

## 1. Why this resolves policy 10.2.9

Microsoft Store policy 10.2.9 rejects Store submissions that expose an unsigned installer or executable outside a managed package. The MSIX workflow wraps the app and required runtime files in a signed package with a valid identity, version, and publisher metadata. This prevents the app from being distributed as a standalone unsigned EXE installer.

## 2. Product identity

The configured identity is:

- Product: `Scacchi Painter X`
- Publisher: `Ganori`
- App ID: `Ganori.ScacchiPainterX`
- Version: `0.5.0`
- Architecture: `x64`

These values must remain stable in the Store submission and in the generated package.

## 3. Required build outputs

The Windows Store build must create a signed MSIX package:

```powershell
cd Gui/sp-gui
pnpm install --frozen-lockfile
pnpm tauri build --target x86_64-pc-windows-msvc --bundles app
```

The output should be a signed `.msix` or `.msixbundle` in:

```text
Gui/sp-gui/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/
```

## 4. Package compliance checklist

- The package is signed with a valid certificate
- Package version is in the required format and increments correctly
- Publisher identity matches the store account and package identity
- App architecture is x64
- Files are contained within an MSIX package, not side-loaded as standalone executables
- No unsigned EXE installer is distributed as the primary artifact
- AppData, settings, and local state remain within the user app sandbox under Store rules

## 5. Validation commands

```powershell
signtool verify /pa "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\ScacchiPainterX.msix"
makeappx validate "Gui\sp-gui\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\ScacchiPainterX.msix"
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
2. Sign the package with a valid certificate.
3. Validate with `signtool` and `makeappx`.
4. Upload the signed package to the Microsoft Store submission flow.
5. Confirm the package identity, version, and metadata match the Store account.
6. Submit for review.

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

The repository is configured to use Tauri 2-compatible Windows packaging conventions and to target a signed MSIX output instead of an unsigned Windows installer. Final certification still requires a Windows build environment with the valid certificate and Store signing account to generate and submit the signed package.
