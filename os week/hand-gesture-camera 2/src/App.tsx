import React, { useState } from "react";
import HandGestureCamera, { Gesture } from "./HandGestureCamera";

export default function App() {
  const [lastGesture, setLastGesture] = useState<Gesture>("Unknown");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "#0f0f14",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Hand Gesture Camera</h1>
      <HandGestureCamera onGesture={setLastGesture} width={640} height={480} />
      <p>
        Last detected gesture: <strong>{lastGesture}</strong>
      </p>
      <p style={{ opacity: 0.7, maxWidth: 520, textAlign: "center" }}>
        Allow camera access when prompted. Try: open palm, fist, peace sign,
        pointing finger, thumbs up.
      </p>
    </div>
  );
}
