import React, { useEffect, useRef, useState, useCallback } from "react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

/**
 * HandGestureCamera
 * - Always renders the <video> element so the browser actually requests camera permission.
 * - Uses MediaPipe Hands for REAL hand landmark detection (no mock data).
 * - Detects basic gestures: Open Palm, Fist, Pointing, Peace, Thumbs Up.
 *
 * Usage:
 *   <HandGestureCamera onGesture={(g) => console.log(g)} />
 */

export type Gesture =
  | "Open Palm"
  | "Fist"
  | "Pointing"
  | "Peace"
  | "Thumbs Up"
  | "Unknown";

interface Props {
  onGesture?: (gesture: Gesture) => void;
  width?: number;
  height?: number;
  showOverlay?: boolean;
}

// landmark indices
const TIPS = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 };
const PIPS = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 };

function detectGesture(landmarks: { x: number; y: number; z: number }[]): Gesture {
  if (!landmarks || landmarks.length < 21) return "Unknown";

  // A finger is "extended" if its tip is above (smaller y) its PIP joint.
  const isExtended = (tip: number, pip: number) => landmarks[tip].y < landmarks[pip].y;

  // Thumb uses x-axis comparison (mirrored video → use absolute distance from wrist).
  const wrist = landmarks[0];
  const thumbExtended =
    Math.abs(landmarks[TIPS.thumb].x - wrist.x) >
    Math.abs(landmarks[PIPS.thumb].x - wrist.x);

  const index = isExtended(TIPS.index, PIPS.index);
  const middle = isExtended(TIPS.middle, PIPS.middle);
  const ring = isExtended(TIPS.ring, PIPS.ring);
  const pinky = isExtended(TIPS.pinky, PIPS.pinky);

  if (index && middle && ring && pinky && thumbExtended) return "Open Palm";
  if (!index && !middle && !ring && !pinky && !thumbExtended) return "Fist";
  if (index && middle && !ring && !pinky) return "Peace";
  if (index && !middle && !ring && !pinky) return "Pointing";
  if (thumbExtended && !index && !middle && !ring && !pinky) return "Thumbs Up";
  return "Unknown";
}

export const HandGestureCamera: React.FC<Props> = ({
  onGesture,
  width = 640,
  height = 480,
  showOverlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const lastGestureRef = useRef<Gesture>("Unknown");

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [gesture, setGesture] = useState<Gesture>("Unknown");

  const handleResults = useCallback(
    (results: Results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        if (showOverlay) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF88",
            lineWidth: 3,
          });
          drawLandmarks(ctx, landmarks, { color: "#FF0066", lineWidth: 1, radius: 3 });
        }
        const g = detectGesture(landmarks);
        if (g !== lastGestureRef.current) {
          lastGestureRef.current = g;
          setGesture(g);
          onGesture?.(g);
        }
      } else {
        if (lastGestureRef.current !== "Unknown") {
          lastGestureRef.current = "Unknown";
          setGesture("Unknown");
          onGesture?.("Unknown");
        }
      }
      ctx.restore();
    },
    [onGesture, showOverlay]
  );

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });
    hands.onResults(handleResults);
    handsRef.current = hands;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width,
      height,
    });
    cameraRef.current = camera;

    camera
      .start()
      .then(() => setStatus("ready"))
      .catch((err) => {
        console.error("Camera start failed:", err);
        setStatus("error");
        setErrorMsg(err?.message || "Unable to access camera");
      });

    return () => {
      cameraRef.current?.stop();
      handsRef.current?.close();
    };
  }, [handleResults, width, height]);

  return (
    <div style={{ position: "relative", width, height }}>
      {/* video MUST always be rendered so getUserMedia is invoked */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          visibility: "hidden",
        }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)",
          borderRadius: 12,
          background: "#000",
        }}
      />

      {status === "loading" && (
        <div style={overlayStyle}>Loading camera & hand model…</div>
      )}
      {status === "error" && (
        <div style={{ ...overlayStyle, color: "#ff6b6b" }}>
          Camera error: {errorMsg}
        </div>
      )}
      {status === "ready" && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 12px",
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            borderRadius: 8,
            fontFamily: "sans-serif",
            fontSize: 14,
          }}
        >
          Gesture: <strong>{gesture}</strong>
        </div>
      )}
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  background: "rgba(0,0,0,0.6)",
  borderRadius: 12,
  fontFamily: "sans-serif",
};

export default HandGestureCamera;
