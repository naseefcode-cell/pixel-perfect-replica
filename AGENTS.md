<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## MindTilt game

- Perspective puzzle logic lives in `src/game/perspective.ts`: nodes are merged by screen-space proximity (orthographic projection, fixed pitch), so "connection" is always a view-dependent computation, never hardcoded per level.
- Levels are authored with the `LB` builder in `src/game/builder.ts` (`src/game/levels.ts`) so all 30 levels stay compact and machine-verifiable by the yaw/time sweep solver.
- The character auto-walks; when no route to the goal exists it paces its reachable region (`wanderStep`) so any alignment the player finds is usable.
- In-scene text uses canvas-texture billboard labels, not drei `<Html>`, which failed to mount inside this SSR-disabled route.
- `tsconfig.json` disables `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noPropertyAccessFromIndexSignature` because the game code is index-heavy math where those checks add noise, not safety.
