# Full Project Analysis: Gesture PDF Presenter

## 0.1 What the Project Is
**Gesture PDF Presenter** is an open-source, touchless presentation control system that transforms standard webcams into interactive gesture sensors.

Engineered for lecturers, keynote speakers, and conference presenters, it eliminates the need for handheld physical clickers or running back and forth to a laptop. Presenters simply face their audience and use natural hand gestures in mid-air to advance slides, return to previous sections, point virtual laser beams, and draw digital annotations directly over live PDF documents.

## 0.2 Real-Time Gesture Processing Loop Diagram

```mermaid
flowchart TD
    Camera[WebCam RGB Video Stream 30fps] --> Capture[react-webcam Buffer]
    Capture --> MediaPipe[MediaPipe Hands Wasm ML Pipeline]
    
    MediaPipe --> Landmarks[21 3D Hand Landmarks Normalized XYZ]
    Landmarks --> Heuristic[Gesture Recognition Engine]
    
    Heuristic --> SwipeRight{Swipe Right?}
    Heuristic --> SwipeLeft{Swipe Left?}
    Heuristic --> Pointing{Index Pointing?}
    Heuristic --> Pinch{Pinch Distance?}

    SwipeRight -->|Yes| NextSlide[PDF.js: Next Slide Event]
    SwipeLeft -->|Yes| PrevSlide[PDF.js: Previous Slide Event]
    Pointing -->|Yes| Laser[Render Virtual Laser Pointer on Canvas]
    Pinch -->|Yes| Zoom[Dynamic Slide Zoom & Pan]

    NextSlide --> Render[Canvas Slide Viewport]
    PrevSlide --> Render
    Laser --> Render
    Zoom --> Render
```

## 0.3 Inventory Counts
- **Total Frontend Views**: 1 interactive presentation console with HUD overlay and gesture guidance drawer.
- **Backend Endpoints**: 4 REST endpoints (`/api/upload`, `/api/presentations`, `/api/health`).
- **Computer Vision Landmarks**: 21 continuous 3D coordinate pairs tracked per frame.
- **Supported Gestures**: 6 distinct gestures (Next, Previous, Laser Point, Draw, Zoom, Clear).
