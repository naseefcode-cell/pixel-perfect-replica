import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { GameCanvas } from "@/components/game/GameCanvas";
import { HUD } from "@/components/game/HUD";
import { LevelSelect, TitleScreen } from "@/components/game/Screens";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MindTilt — Perspective Puzzles That Troll You" },
      {
        name: "description",
        content:
          "Rotate the world, line up impossible platforms and guide a tiny confused hero through 30 perspective puzzles full of fake exits, useless buttons and hidden ducks.",
      },
      { property: "og:title", content: "MindTilt — Perspective Puzzles That Troll You" },
      {
        property: "og:description",
        content:
          "30 hand-built optical-illusion levels. Rotate the camera, make impossible paths real, get pranked.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:site_name", content: "MindTilt" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MindTilt — Perspective Puzzles That Troll You" },
      {
        name: "twitter:description",
        content:
          "30 hand-built optical-illusion levels. Rotate the camera, make impossible paths real, get pranked.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: "MindTilt",
          description:
            "A browser perspective puzzle game with 30 levels: rotate the world to connect impossible paths.",
          genre: ["Puzzle", "Casual"],
          gamePlatform: "Web browser",
          playMode: "SinglePlayer",
          applicationCategory: "Game",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  const screen = useGame((s) => s.screen);
  const hydrate = useGame((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-background text-foreground">
      {screen === "play" && (
        <>
          <GameCanvas />
          <HUD />
        </>
      )}
      {screen === "title" && <TitleScreen />}
      {screen === "select" && <LevelSelect />}
    </main>
  );
}
