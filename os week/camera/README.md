# 📷 Camera Access Module

This folder contains all camera-related components and utilities for the Gesture PDF Annotator.

## Files

### Components
- **WebcamPiP.tsx** - Picture-in-Picture webcam component
  - Handles camera stream display
  - Permission management
  - Resize and position controls
  - Auto-requests permission only when camera is toggled on

### Utilities & Hooks
- **use-hand-gesture.ts** - Hand gesture detection hook
  - MediaPipe integration for hand tracking
  - Gesture recognition (peace, thumbs-up, pointing, etc.)
  - Confidence scoring
  - Real-time detection with debouncing

### Documentation
- **CAMERA_INTEGRATION_GUIDE.md** - Setup and integration guide
- **CAMERA_FIX_SUMMARY.md** - Summary of camera fixes and improvements

### Export Module
- **index.ts** - Central export point for all camera functionality

## Usage

```typescript
// Import from the camera module
import { WebcamPiP, useHandGesture } from '@/camera';

// Use WebcamPiP component
<WebcamPiP 
  visible={showCamera}
  position="top-right"
  size="medium"
/>

// Use hand gesture hook
const { gesture, confidence } = useHandGesture(onDetected, canvasRef, videoRef);
```

## Key Features

✅ **Optional Camera Access** - Camera permission only requested when needed  
✅ **Hand Gesture Detection** - Real-time gesture recognition  
✅ **Picture-in-Picture** - Flexible webcam positioning  
✅ **No Forced Permissions** - Works without camera access  
✅ **Gesture Confidence Scoring** - Reliable gesture detection with confidence thresholds  

## Architecture

- WebcamPiP manages camera stream UI and permission flow
- use-hand-gesture provides ML-based gesture detection
- All gesture-related logic is isolated in this module
- Clear separation of concerns with index.ts exports
