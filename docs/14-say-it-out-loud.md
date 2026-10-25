# Say It Out Loud: Spoken Interview Scripts

## Project Pitch (60 Seconds)
> "I built the Gesture PDF Presenter, an interactive touchless presentation system powered by MediaPipe computer vision, React 18, and PDF.js. Using a standard laptop webcam, it tracks 21 hand landmarks in real time to let speakers advance slides, zoom into diagrams, and activate a virtual laser pointer using natural hand gestures in mid-air—eliminating the need for handheld clickers or touching a keyboard."

## Feature Scripts
### F1: MediaPipe 21-Landmark Tracking Pipeline
> "I built the tracking pipeline using Google's MediaPipe Hands in `GestureControl.tsx`. The webcam captures video at 30 frames per second, passing each frame to MediaPipe's WebAssembly model. It outputs 21 normalized three-dimensional landmarks corresponding to every knuckle and joint in the hand with sub-15 millisecond latency, providing the mathematical coordinates needed for touchless gesture detection."

### F2: Touchless Slide Navigation
> "To advance slides reliably, in `services/gestures.ts` I engineered a directional velocity algorithm. A common issue with computer vision presentations is accidental slide changes when a speaker moves their hands while speaking. My engine tracks wrist landmark velocity over five consecutive frames. Only deliberate swipes moving faster than 400 pixels per second trigger a slide transition, followed by an immediate 500-millisecond lock to prevent double-skipping."
