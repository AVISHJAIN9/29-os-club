import React, { useEffect, useRef, useState, useCallback } from "react";

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
}

const TIPS = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 };
const PIPS = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 };

function detectGesture(lm: { x: number; y: number; z: number }[]): Gesture {
  if (!lm || lm.length < 21) return "Unknown";
  const ext = (tip: number, pip: number) => lm[tip].y < lm[pip].y;
  const wrist = lm[0];
  const thumb =
    Math.abs(lm[TIPS.thumb].x - wrist.x) >
    Math.abs(lm[PIPS.thumb].x - wrist.x);
  const index = ext(TIPS.index, PIPS.index);
  const middle = ext(TIPS.middle, PIPS.middle);
  const ring = ext(TIPS.ring, PIPS.ring);
  const pinky = ext(TIPS.pinky, PIPS.pinky);

  if (index && middle && ring && pinky && thumb) return "Open Palm";
  if (!index && !middle && !ring && !pinky && !thumb) return "Fist";
  if (index && middle && !ring && !pinky) return "Peace";
  if (index && !middle && !ring && !pinky) return "Pointing";
  if (thumb && !index && !middle && !ring && !pinky) return "Thumbs Up";
  return "Unknown";
}

export const HandGestureCamera: React.FC<Props> = ({
  onGesture,
  width = 320,
  height = 240,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastRef = useRef<Gesture>("Unknown");
  const lastFireRef = useRef<number>(0);
  const onGestureRef = useRef(onGesture);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [gesture, setGesture] = useState<Gesture>("Unknown");

  const drawHelpersRef = useRef<any>(null);

  useEffect(() => {
    onGestureRef.current = onGesture;
  }, [onGesture]);

  const handleResults = useCallback(
    (results: { image: CanvasImageSource; multiHandLandmarks?: { x: number; y: number; z: number }[][] }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const drawHelpers = drawHelpersRef.current;
      if (!ctx || !drawHelpers) return;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        drawHelpers.drawConnectors(ctx, lm, drawHelpers.handConnections, { color: "#00FF88", lineWidth: 2 });
        drawHelpers.drawLandmarks(ctx, lm, { color: "#FF0066", lineWidth: 1, radius: 2 });
        const g = detectGesture(lm);
        const now = Date.now();
        if (g !== "Unknown" && (g !== lastRef.current || now - lastFireRef.current > 1200)) {
          lastRef.current = g;
          lastFireRef.current = now;
          setGesture(g);
          onGestureRef.current?.(g);
        } else if (g === "Unknown") {
          lastRef.current = "Unknown";
        }
      } else {
        lastRef.current = "Unknown";
      }
      ctx.restore();
    },
    []
  );

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    let cancelled = false;

    (async () => {
      try {
        const handsModule = await import("@mediapipe/hands");
        const cameraModule = await import("@mediapipe/camera_utils");
        const drawingModule = await import("@mediapipe/drawing_utils");

        const handsPkg = handsModule.default ?? handsModule;
        const cameraPkg = cameraModule.default ?? cameraModule;
        const drawingPkg = drawingModule.default ?? drawingModule;

        const HandsCtor = handsPkg.Hands;
        const CameraCtor = cameraPkg.Camera;

        drawHelpersRef.current = {
          drawConnectors: drawingPkg.drawConnectors,
          drawLandmarks: drawingPkg.drawLandmarks,
          handConnections: handsPkg.HAND_CONNECTIONS,
        };

        const hands = new HandsCtor({
          locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        });
        hands.onResults(handleResults);
        if (cancelled) {
          hands.close();
          return;
        }
        handsRef.current = hands;

        const camera = new CameraCtor(video, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width,
          height,
        });

        if (cancelled) {
          camera.stop();
          return;
        }

        cameraRef.current = camera;
        await camera.start();
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Camera unavailable");
        }
      }
    })();

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      handsRef.current?.close();
      cameraRef.current = null;
      handsRef.current = null;
      drawHelpersRef.current = null;
    };
  }, [handleResults, width, height]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-black" style={{ width, height }}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", visibility: "hidden" }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
      />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">Loading camera…</div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-destructive text-xs px-2 text-center">{errorMsg}</div>
      )}
      {status === "ready" && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs">
          {gesture}
        </div>
      )}
    </div>
  );
};

export default HandGestureCamera;