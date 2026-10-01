// Guarded CrazyGames SDK v3 wrapper. Every call is a no-op outside CrazyGames.
import { setAdMute } from "./audio";

type SDK = {
  init: () => Promise<void>;
  environment: string;
  game: { gameplayStart: () => void; gameplayStop: () => void; loadingStart: () => void; loadingStop: () => void };
  ad: {
    requestAd: (
      type: "midgame" | "rewarded",
      cb: { adStarted?: () => void; adFinished?: () => void; adError?: (e: unknown) => void },
    ) => void;
  };
};

let sdk: SDK | null = null;
let ready = false;
let playing = false;

export async function initCrazy() {
  if (typeof window === "undefined" || ready) return;
  const w = window as unknown as { CrazyGames?: { SDK: SDK } };
  try {
    if (!w.CrazyGames) {
      await new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://sdk.crazygames.com/crazygames-sdk-v3.js";
        s.onload = () => res();
        s.onerror = () => rej(new Error("sdk"));
        document.head.appendChild(s);
      });
    }
    if (!w.CrazyGames) return;
    await w.CrazyGames.SDK.init();
    sdk = w.CrazyGames.SDK;
    ready = true;
    if (sdk.environment === "disabled") sdk = null;
  } catch {
    sdk = null;
  }
}

const safe = (f: () => void) => {
  try {
    f();
  } catch {
    /* ignore */
  }
};

export const crazy = {
  loadingStart: () => sdk && safe(() => sdk!.game.loadingStart()),
  loadingStop: () => sdk && safe(() => sdk!.game.loadingStop()),
  gameplayStart: () => {
    if (!sdk || playing) return;
    playing = true;
    safe(() => sdk!.game.gameplayStart());
  },
  gameplayStop: () => {
    if (!sdk || !playing) return;
    playing = false;
    safe(() => sdk!.game.gameplayStop());
  },
  midgame: (done: () => void) => {
    if (!sdk) return done();
    crazy.gameplayStop();
    let finished = false;
    const end = () => {
      if (finished) return;
      finished = true;
      setAdMute(false);
      done();
    };
    safe(() =>
      sdk!.ad.requestAd("midgame", {
        adStarted: () => setAdMute(true),
        adFinished: end,
        adError: end,
      }),
    );
  },
};
