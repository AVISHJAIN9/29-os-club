# Architecture & Real-Time Computer Vision Loop

## High-Level Architecture

```mermaid
graph TD
    WebCam[Laptop WebCam] --> Stream[MediaStream 640x480 @ 30fps]
    Stream --> WebWorker[MediaPipe Wasm Worker Thread]
    WebWorker --> Landmarks[Normalized 3D Landmarks]
    
    subgraph "Main UI Thread (60fps)"
        Landmarks --> Heuristic[Gesture Classifier]
        Heuristic --> State[Presentation State Reducer]
        State --> CanvasRenderer[HTML5 Canvas Slide Viewport]
        State --> LaserOverlay[HUD & Laser Pointer Overlay]
    end
```

## Threading Architecture
The MediaPipe vision pipeline runs asynchronously in WebAssembly threads, preventing heavy computer vision calculations from blocking smooth 60fps slide animations on the main JavaScript thread.
