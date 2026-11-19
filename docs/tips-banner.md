# Tip Banner

The landing page can display a rotating startup tip banner. Tips are loaded from `@sp/gui/src/assets/tips.json`, normalized into a clean string list, and synced with IndexedDB state.

## Behavior

- A startup tip is selected according to the tip weight distribution.
- Existing tips keep their stored weight; newly added tips start at 128.
- Tips are decayed at most once per session.
- The banner stays hidden when the JSON list is empty or the user disables startup tips.
- Manual navigation moves through the available tips while preserving the same session decay rules.

## Files

- `@sp/gui/src/app/services/tips.service.ts` — pure tip logic and IndexedDB sync
- `@sp/gui/src/app/uiElements/tip-banner/tip-banner.component.ts` — Material banner UI
- `@sp/gui/src/app/landing/landing.component.ts` — startup wiring and integration
- `@sp/gui/src/assets/tips.json` — bundled default tips

New tips added with a release (for example the Awards Maker, fairy effects in solutions, SP2 Save As and the desktop local file provider in 0.6.0) start with the higher default weight, so they appear more often until their weight decays.
