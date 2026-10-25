# Build Order: Reconstructing Gesture PDF Presenter

## Step-by-Step Implementation Flow

```mermaid
flowchart TD
    Step1[1. Express & Multer Upload Server] --> Step2[2. React 18 & Vite Frontend Scaffold]
    Step2 --> Step3[3. PDF.js Document Viewport]
    Step3 --> Step4[4. react-webcam Video Acquisition]
    Step4 --> Step5[5. MediaPipe Hands Integration]
    Step5 --> Step6[6. Geometric Gesture Engine & Debounce]
    Step6 --> Step7[7. Laser Pointer & Annotation Overlays]
```

1. **Upload Server**: Implement `server.ts` with Multer file storage and PDF magic-byte checks.
2. **Frontend Setup**: Initialize Vite + React 18 with Tailwind CSS and Lucide icons.
3. **PDF Viewer**: Build `usePDFViewer.ts` integrating `pdfjs-dist` on an HTML5 canvas.
4. **Camera Stream**: Connect `react-webcam` with mirror transformation and 30fps capture.
5. **MediaPipe Tracking**: Initialize `@mediapipe/hands` WebAssembly worker.
6. **Gesture Recognition**: Develop Euclidean vector heuristics and temporal debounce locks.
7. **Overlay Canvases**: Implement `LaserCursor.tsx` and drawing tools.
