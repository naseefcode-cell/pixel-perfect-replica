# Bring MindTilt up to CrazyGames quality

Approval can't be guaranteed (CrazyGames reviews by hand), but these changes close the clear gaps against their guidelines.

## Current gaps found
- No sound or music at all (guidelines expect good, balanced audio).
- No in-game tutorial: new players land in level 1 with no visual "drag to rotate" guidance.
- Escape opens level select — CrazyGames lists Escape as a restricted key (it exits fullscreen).
- WASD only; AZERTY players (ZQSD) aren't supported.
- No CrazyGames SDK (loading events, gameplay start/stop, ad breaks between levels).
- No Pause/Settings menu (mute, volume).

## What to build
1. **Visual onboarding in level 1**: animated hand/mouse "drag to rotate" overlay plus key icons (arrows / WASD), disappears on first rotation, skippable, shown once.
2. **Audio**: lightweight generated sound effects (step, align "click", fall, win jingle, troll sting) and a soft ambient loop, all via Web Audio (no files). Consistent volume.
3. **Settings / pause menu**: Pause button and P key; mute SFX, mute music, volume slider; saved locally.
4. **Controls fix**: replace Escape with P / pause button; use physical key codes so WASD works as ZQSD on AZERTY.
5. **CrazyGames SDK**: load SDK script, call loading start/stop, gameplayStart/Stop on play/pause/win, and a midgame ad break when moving to the next level (every 2-3 levels), muting audio during ads. Safe no-op when not on CrazyGames.
6. **Polish pass**: clear button labels on win/pause screens, no delayed buttons, check mobile layout.

## Technical details
- Sound engine: new `src/game/audio.ts` (Web Audio oscillators/noise), hooked from Scene events and store.
- SDK wrapper: `src/game/crazygames.ts` with guarded calls; script tag added in root head.
- Key handling in `GameCanvas.tsx` switches to `e.code` (KeyW/KeyA/...).
- Onboarding flag stored in the existing save.
