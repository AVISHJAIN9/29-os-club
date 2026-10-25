# Interview Preparation: 150+ Questions & Answers

## Core Architectural Questions

### Q1: Can you walk me through the architecture of the Gesture PDF Presenter?
**Answer**:
Gesture PDF Presenter is a touchless presentation control system built with React 18, TypeScript, and Node.js. It captures standard webcam video via `react-webcam` and processes frames through Google's MediaPipe Hands WebAssembly pipeline at 30 frames per second. The pipeline extracts 21 three-dimensional hand landmarks per frame, passing them to our geometric gesture engine in `GestureControl.tsx`. The engine classifies mid-air gestures—such as lateral swipes for page transitions, index finger extension for virtual laser pointing, and pinch gestures for zooming—dispatching events to a PDF.js canvas renderer that displays vectorized slides.

### Q2: How do you prevent accidental slide flips when a speaker naturally gestures while talking?
**Answer**:
In `services/gestures.ts`, we implement a two-stage filter. First, we track the lateral velocity of the wrist landmark ($dx/dt$) over five consecutive frames; a slide change is only registered if velocity exceeds 400 pixels per second. Second, once a swipe is recognized, the system locks into a 500-millisecond refractory debounce window, ignoring all motion until the presenter stabilizes their hand.

### Q3: Why did you run MediaPipe client-side rather than streaming video to a server?
**Answer**:
Streaming 30fps 720p video to a server creates massive network bandwidth consumption and introduces 150-300ms of latency, which destroys the responsive feel of a laser pointer. By running MediaPipe's WebAssembly and WebGL models directly on the client's laptop, landmark tracking executes with sub-18ms latency with zero bandwidth consumption and complete camera privacy.

### Q4: How does the virtual laser pointer work mathematically?
**Answer**:
When our classifier detects an extended index finger while the other three fingers remain curled toward the palm, it enters laser pointer mode. It takes the normalized $\{x, y\}$ coordinates of Landmark 8 (index fingertip), scales them to the slide canvas dimensions, and draws a glowing circular radial gradient on an overlaid HTML5 canvas with sub-pixel interpolation.

### Q5: How do you ensure high-DPI crispness when rendering PDFs?
**Answer**:
We query the browser's `window.devicePixelRatio` (often 2x on Retina displays). In `usePDFViewer.ts`, we scale the canvas width and height by this ratio while setting its CSS style width and height to the logical display size, ensuring crisp, unblurred rendering of dense vector diagrams and small fonts.
