# Project Pitch: Gesture PDF Presenter

## 30-Second Elevator Pitch
"I built the **Gesture PDF Presenter**, an interactive touchless presentation system powered by MediaPipe computer vision, React 18, and PDF.js. Using a standard laptop webcam, it tracks 21 hand landmarks in real time to let speakers advance slides, zoom into diagrams, and activate a virtual laser pointer using natural hand gestures in mid-air—eliminating the need for handheld clickers or touching a keyboard."

## 2-Minute Spoken Pitch
"Every presenter has experienced the awkward dance of holding a physical clicker, accidentally pressing the wrong button, or being tethered to a podium keyboard while trying to engage an audience.

To create a natural presentation experience, I engineered the Gesture PDF Presenter:

First, for real-time vision without cloud latency, our application runs Google's MediaPipe Hands model entirely client-side using WebAssembly and WebGL. It tracks 21 distinct 3D knuckle and fingertip landmarks from a standard webcam stream at 30 frames per second.

Second, in `GestureControl.tsx`, I built a geometric gesture recognition engine. Rather than relying on black-box neural networks that are prone to lag, it computes Euclidean vectors and angle differentials between fingertip landmarks. For instance, detecting an extended index finger while the other three fingers remain curled activates our virtual laser pointer overlay.

Third, to prevent accidental slide flips when a speaker naturally gestures while talking, I implemented a temporal debounce filter with directional velocity thresholds. A slide transition only triggers if an open palm moves laterally across the frame at over 400 pixels per second and stays stable for at least 300 milliseconds.

Finally, on the document layer, we use PDF.js and HTML5 Canvas to render vectorized PDF slides with crisp scaling, allowing presenters to draw live digital annotations and zoom into charts using two-finger pinch gestures.

The entire system requires zero dedicated hardware—just a browser and a webcam."
