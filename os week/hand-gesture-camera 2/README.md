# Hand Gesture Camera

A fully working React + TypeScript hand gesture detection app using **MediaPipe Hands** (real detection — no mock landmarks).

## Why your previous version didn't work
1. The `<video>` / `<Webcam />` element was conditionally rendered based on `cameraPermission === 'granted'`. Browsers only **prompt** for permission when a media element actually mounts — so it was stuck forever in "pending".
2. Your `use-hand-gesture` hook used `generateMockLandmarks()` instead of real ML detection.

This version fixes both:
- The `<video>` element is **always mounted** (only its visibility is hidden), so `getUserMedia` runs immediately.
- Uses MediaPipe Hands for **real** 21-point hand landmark detection.
- Detects: Open Palm, Fist, Peace, Pointing, Thumbs Up.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints, allow camera access, and show your hand.

## Files
- `src/HandGestureCamera.tsx` — drop-in component
- `src/App.tsx` — example usage
