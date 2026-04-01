"use client";

import { useRive } from "@rive-app/react-canvas";

/**
 * Programs hero Rive animation — autoplay, full-bleed.
 * Single .riv file for all breakpoints. On mobile the animation is rendered
 * larger than its container and cropped via overflow-hidden on the parent,
 * matching the Framer implementation.
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
