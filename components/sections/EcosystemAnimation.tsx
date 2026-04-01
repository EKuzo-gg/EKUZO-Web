"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

// ── DEBUG MODE ──────────────────────────────────────────────────────
// Set to true to show a floating debug panel with rive value + manual override
const DEBUG = false;

const DESKTOP_RIV = "/animations/ecosystem-desktop.riv";
const MOBILE_RIV = "/animations/ecosystem-mobile.riv";

const STATE_MACHINE = "State Machine 1";
const INPUT_NAME = "ScrollProgressIllo";

// Rive state machine input range — must match Framer spec:
// Desktop: 0–1000, Mobile: 0–500
const PROGRESS_MAX_DESKTOP = 1000;
const PROGRESS_MAX_MOBILE = 500;

// Scroll zones (as fraction of total scrollable distance through the container)
// 0–8%: start delay (progress stays at 0)
// 8–92%: animation plays 0→1000
// 92–100%: end hold (progress stays at 1000)
const START_FRACTION = 0.08;
const END_FRACTION = 0.92;

/**
 * Finds the tall scroll container (the 360vh section) by walking up the DOM.
 * Caches the result on the element to avoid repeated DOM traversal.
 */
function findScrollContainer(element: HTMLElement): HTMLElement | null {
  // Check cache
  const cached = (element as any).__scrollContainer;
  if (cached !== undefined) return cached;

  let container: HTMLElement | null = element.parentElement;
  while (container) {
    // Look for a section whose explicit style height makes it taller than viewport
    if (
      container.tagName === "SECTION" &&
      container.offsetHeight > window.innerHeight * 1.5
    ) {
      (element as any).__scrollContainer = container;
      return container;
    }
    container = container.parentElement;
  }
  (element as any).__scrollContainer = null;
  return null;
}

/**
 * Calculates the scroll progress (0→1) through the parent 360vh container.
 * Uses getBoundingClientRect for accurate position relative to viewport.
 */
function getContainerScrollProgress(container: HTMLElement): number {
  const rect = container.getBoundingClientRect();
  const scrollableDistance = container.offsetHeight - window.innerHeight;
  if (scrollableDistance <= 0) return 0;

  const scrolled = -rect.top;
  return Math.max(0, Math.min(1, scrolled / scrollableDistance));
}

/**
 * Maps raw container scroll progress (0→1) to Rive input (0→progressMax)
 * with start delay and end hold zones.
 */
function mapToRiveProgress(rawProgress: number, progressMax: number): number {
  if (rawProgress <= START_FRACTION) return 0;
  if (rawProgress >= END_FRACTION) return progressMax;

  const normalized =
    (rawProgress - START_FRACTION) / (END_FRACTION - START_FRACTION);
  return normalized * progressMax;
}

/**
 * Returns true if the container is within ~1 viewport of being visible.
 * Used to play/pause Rive for performance without unreliable IntersectionObserver.
 */
function isContainerNearViewport(container: HTMLElement): boolean {
  const rect = container.getBoundingClientRect();
  const buffer = window.innerHeight;
  return rect.bottom > -buffer && rect.top < window.innerHeight + buffer;
}

function EcosystemScroll({
  rivSrc,
  artboard,
  progressMax,
}: {
  rivSrc: string;
  artboard: string;
  progressMax: number;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Debug state
  const [debugInfo, setDebugInfo] = useState({ rawScroll: 0, riveValue: 0 });
  const [manualOverride, setManualOverride] = useState<number | null>(null);
  const manualRef = useRef<number | null>(null);

  const { RiveComponent, rive: riveInstance } = useRive({
    src: rivSrc,
    artboard,
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const scrollInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE,
    INPUT_NAME,
    0
  );

  // Scroll handler — runs on every scroll event via rAF
  const onScroll = useCallback(() => {
    const el = wrapperRef.current;
    if (!el || !scrollInput || !riveInstance) return;

    const container = findScrollContainer(el);
    if (!container) return;

    // Play/pause based on proximity to viewport
    const nearViewport = isContainerNearViewport(container);
    if (nearViewport && !isPlayingRef.current) {
      riveInstance.play();
      isPlayingRef.current = true;
    } else if (!nearViewport && isPlayingRef.current) {
      riveInstance.pause();
      isPlayingRef.current = false;
    }

    if (!nearViewport) return;

    const rawProgress = getContainerScrollProgress(container);
    const riveProgress = mapToRiveProgress(rawProgress, progressMax);

    // Debug: update info display
    if (DEBUG) {
      setDebugInfo({ rawScroll: rawProgress, riveValue: riveProgress });
    }

    // If manual override is active, use that value instead
    const currentManual = manualRef.current;
    if (currentManual !== null) {
      if (Math.abs(currentManual - progressRef.current) > 0.01) {
        progressRef.current = currentManual;
        scrollInput.value = currentManual;
      }
      return;
    }

    // Only update if value actually changed (avoid unnecessary Rive updates)
    if (Math.abs(riveProgress - progressRef.current) > 0.5) {
      progressRef.current = riveProgress;
      scrollInput.value = riveProgress;
    }
  }, [scrollInput, riveInstance, progressMax]);

  // Attach scroll listener — always on, uses proximity check internally
  useEffect(() => {
    if (!scrollInput || !riveInstance) return;

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(onScroll);
    };

    // Initial sync
    onScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also listen for resize (viewport height changes affect calculations)
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollInput, riveInstance, onScroll]);

  // Touch forwarding for Rive interactive elements
  useEffect(() => {
    if (!riveInstance) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const canvas = wrapper.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const rectToCanvasXY = (touch: Touch) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches?.length) return;
      const { x, y } = rectToCanvasXY(e.touches[0]);
      (riveInstance as any).pointerDown?.(x, y);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches?.length) return;
      const { x, y } = rectToCanvasXY(e.touches[0]);
      (riveInstance as any).pointerMove?.(x, y);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches?.[0];
      if (!t) return;
      const { x, y } = rectToCanvasXY(t);
      (riveInstance as any).pointerUp?.(x, y);
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart as any);
      canvas.removeEventListener("touchmove", onTouchMove as any);
      canvas.removeEventListener("touchend", onTouchEnd as any);
      canvas.removeEventListener("touchcancel", onTouchEnd as any);
    };
  }, [riveInstance]);

  // Debug: keyboard controls for manual rive value override
  useEffect(() => {
    if (!DEBUG || !scrollInput || !riveInstance) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Press 'D' to toggle manual override on/off
      if (e.key === "d" || e.key === "D") {
        if (manualRef.current === null) {
          manualRef.current = progressRef.current;
          setManualOverride(manualRef.current);
        } else {
          manualRef.current = null;
          setManualOverride(null);
        }
        return;
      }

      if (manualRef.current === null) return;

      // Arrow keys to adjust value
      let step = 1;
      if (e.shiftKey) step = 10;
      if (e.altKey) step = 50;

      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        manualRef.current = Math.min(progressMax, manualRef.current + step);
        scrollInput.value = manualRef.current;
        progressRef.current = manualRef.current;
        setManualOverride(manualRef.current);
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        manualRef.current = Math.max(0, manualRef.current - step);
        scrollInput.value = manualRef.current;
        progressRef.current = manualRef.current;
        setManualOverride(manualRef.current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scrollInput, riveInstance]);

  return (
    <div ref={wrapperRef} className="w-full h-screen relative">
      <RiveComponent style={{ width: "100%", height: "100%" }} />
      {DEBUG && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "rgba(0,0,0,0.85)",
            color: "#0f0",
            fontFamily: "monospace",
            fontSize: 13,
            padding: "12px 16px",
            borderRadius: 8,
            zIndex: 9999,
            lineHeight: 1.6,
            pointerEvents: "none",
          }}
        >
          <div>Scroll: {(debugInfo.rawScroll * 100).toFixed(1)}%</div>
          <div>Rive input: {debugInfo.riveValue.toFixed(1)}</div>
          <div>PROGRESS_MAX: {progressMax}</div>
          <div style={{ borderTop: "1px solid #333", marginTop: 6, paddingTop: 6 }}>
            {manualOverride !== null ? (
              <>
                <div style={{ color: "#ff0" }}>MANUAL: {manualOverride.toFixed(1)}</div>
                <div style={{ fontSize: 11, color: "#888" }}>
                  ↑↓ = ±1 | +Shift = ±10 | +Alt = ±50
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>Press D to exit manual</div>
              </>
            ) : (
              <div style={{ fontSize: 11, color: "#888" }}>Press D for manual control</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EcosystemAnimation() {
  return (
    <div className="w-full h-full pb-[48px]">
      <div className="hidden md:block w-full h-full">
        <EcosystemScroll rivSrc={DESKTOP_RIV} artboard="Main - Desktop" progressMax={PROGRESS_MAX_DESKTOP} />
      </div>
      <div className="md:hidden w-full h-full">
        <EcosystemScroll rivSrc={MOBILE_RIV} artboard="Main - Mobile" progressMax={PROGRESS_MAX_MOBILE} />
      </div>
    </div>
  );
}
