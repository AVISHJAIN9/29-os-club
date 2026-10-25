# Project Map: 35-os-club (Gesture PDF Presenter)

## Folder Structure
```
35-os-club/
├── docs/                               # Comprehensive VitePress Documentation Suite
├── os week/                            # Core Production Application
│   ├── App.tsx                         # Master presentation workstation
│   ├── GestureControl.tsx              # MediaPipe camera integration & landmark pipeline
│   ├── GestureGuide.tsx                # Interactive HUD tutorial & visual gesture cheat sheet
│   ├── server.ts                       # Express & Multer presentation upload server
│   ├── index.html                      # HTML5 canvas mount
│   ├── vite.config.ts                  # Vite build configuration
│   ├── package.json                    # Dependencies & scripts
│   ├── tailwind.config.ts              # Tailwind CSS styling tokens
│   ├── services/                       # Gesture recognition heuristics & calibration
│   ├── components/                     # Slide thumbnail bar, toolbar, laser cursor
│   ├── utils/                          # Geometry calculations & Euclidean distance
│   └── hooks/                          # Custom useCamera, useGestures, usePDFViewer hooks
└── gesture-pdf-presenter/              # Standalone package workspace
```

## Tech Stack & Dependencies
- `@mediapipe/hands@^0.4`: High-fidelity in-browser hand landmark tracking.
- `react-webcam@^7.2.0`: Camera stream acquisition and frame capture.
- `pdfjs-dist@^3.11.174`: Mozilla's standard vector PDF rendering engine.
- `pdf-lib@^1.17.1`: PDF manipulation and annotation persistence.
- `react@^18.2.0`, `vite@^4.4.0`: Fast reactive frontend architecture.
- `express@^4.18.2`, `multer@^1.4.4`: Backend PDF presentation upload and storage.
