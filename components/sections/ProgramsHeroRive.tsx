"use client";

import { useRive } from "@rive-app/react-canvas";

/**
 * Programs hero Rive animation — autoplay, full-bleed.
 * Matches Framer spec: artboard "Main - Desktop", state machine "State Machine 1",
 * autoplay true, autoBind true.
 */
export default function ProgramsHeroRive() {
  const { RiveComponent } = useRive({
    src: "/animations/programs-hero.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  return (
    <div className="w-full h-full">
      <RiveComponent className="w-full h-full" />
    </div>
  );
}
