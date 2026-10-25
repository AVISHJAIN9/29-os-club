# Technology Comparisons & Architectural Decisions

## 1. Hand Tracking: MediaPipe Hands vs TensorFlow.js Handpose vs OpenCV

| Comparison Factor | MediaPipe Hands (Used) | TensorFlow.js Handpose | OpenCV.js |
|---|---|---|---|
| **Inference Latency** | $\approx 12-18ms$ (Wasm/WebGL) | $45-90ms$ | $>120ms$ (CPU bound) |
| **Landmark Fidelity** | 21 3D Landmarks | 21 3D Landmarks | Contour blobs only |
| **Model Size** | $\approx 5MB$ cached | $>25MB$ | $>15MB$ |
| **Micro-gestures** | Excellent knuckle accuracy | Moderate | Poor |

- **Why MediaPipe**: Delivers sub-20ms inference directly on client laptops with minimal CPU overhead, preserving 60fps UI smoothness. [CONFIRM WITH DEVELOPER]

---

## 2. Slide Rendering: PDF.js vs Image Pre-Conversion (PNGs on server)

| Comparison Factor | Client-Side PDF.js (Used) | Server PNG Pre-conversion |
|---|---|---|
| **Bandwidth** | Lightweight single PDF file | Heavy transfer of 50+ high-res images |
| **Vector Sharpness** | Infinite zoom without blur | Pixels blur when zoomed |
| **Server CPU Load** | \$0 (Rendered on client GPU) | Heavy ImageMagick server rendering |

- **Why PDF.js**: Renders vector-sharp text at any zoom level with zero server-side rendering costs.
