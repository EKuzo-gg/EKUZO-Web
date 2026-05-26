import { RuntimeLoader } from "@rive-app/react-canvas";

// Phase 8b: serve the Rive wasm from our own origin instead of unpkg.com.
// public/rive.wasm is a copy of node_modules/@rive-app/canvas/rive.wasm and
// must stay in sync with the installed @rive-app/canvas version (currently
// 2.35.4). If that version changes, re-copy the file or this call will load
// an outdated runtime.
let configured = false;

export function configureRiveRuntime(): void {
  if (configured || typeof window === "undefined") return;
  configured = true;
  RuntimeLoader.setWasmUrl("/rive.wasm");
}
