import { useEffect, useRef, useCallback, useState } from 'react';

export interface GestureState {
  gesture: string | null;
  isDetected: boolean;
  confidence: number;
  handPosition?: { x: number; y: number };
  hands?: any[];
  landmarks?: any;
}

interface HandLandmarks {
  [key: number]: number[];
}

const GESTURE_CONFIDENCE_THRESHOLD = 0.65;
const GESTURE_DEBOUNCE_MS = 400;

export const useHandGesture = (
  onGestureDetected: (state: GestureState) => void,
  canvasRef?: React.RefObject<HTMLCanvasElement>,
  videoRef?: React.RefObject<HTMLVideoElement>
) => {
  const videoRefLocal = useRef<HTMLVideoElement>(null);
  const canvasRefLocal = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isInitializedRef = useRef(false);
  const lastGestureRef = useRef<string | null>(null);
  const lastGestureTimeRef = useRef<number>(0);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectionCountRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const videoRef_ = videoRef || videoRefLocal;
  const canvasRef_ = canvasRef || canvasRefLocal;

  // Enhanced gesture detection 
  const getHandLandmarks = (hand: any): HandLandmarks => {
    const landmarks: HandLandmarks = {};
    if (hand.keypoints && Array.isArray(hand.keypoints)) {
      hand.keypoints.forEach((point: any, idx: number) => {
        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
          landmarks[idx] = [point.x, point.y];
        }
      });
    }
    return landmarks;
  };

  const getDistance = (p1: number[], p2: number[]): number => {
    if (!p1 || !p2 || p1.length < 2 || p2.length < 2) return 999;
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
  };

  const detectGesture = (hand: any): { gesture: string; confidence: number; position: { x: number; y: number } } => {
    const landmarks = getHandLandmarks(hand);
    
    if (Object.keys(landmarks).length < 21) {
      return { gesture: '', confidence: 0, position: { x: 0, y: 0 } };
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const handX = wrist[0];
    const handY = wrist[1];

    // Calculate distances
    const thumbToIndex = getDistance(thumbTip, indexTip);
    const indexToMiddle = getDistance(indexTip, middleTip);
    const indexToRing = getDistance(indexTip, ringTip);

    // Calculate finger heights
    const thumbHeight = wrist[1] - thumbTip[1];
    const indexHeight = wrist[1] - indexTip[1];
    const middleHeight = wrist[1] - middleTip[1];
    const ringHeight = wrist[1] - ringTip[1];
    const pinkyHeight = wrist[1] - pinkyTip[1];

    const fingerHeights = [indexHeight, middleHeight, ringHeight, pinkyHeight];
    const extendedFingers = fingerHeights.filter(h => h > 0.08).length;
    const closedFingers = fingerHeights.filter(h => h < 0.02).length;

    let gesture = '';
    let confidence = 0;

    // PEACE SIGN
    if (indexHeight > 0.12 && middleHeight > 0.12 && ringHeight < 0.05 && pinkyHeight < 0.05) {
      gesture = 'peace';
      confidence = 0.92;
    }
    // THUMBS UP
    else if (thumbHeight > 0.18 && extendedFingers <= 1) {
      gesture = 'thumbs-up';
      confidence = 0.90;
    }
    // THUMBS DOWN
    else if (thumbHeight < -0.15 && indexHeight < 0.08) {
      gesture = 'thumbs-down';
      confidence = 0.88;
    }
    // FIST
    else if (extendedFingers === 0 && closedFingers >= 3) {
      gesture = 'fist';
      confidence = 0.91;
    }
    // OPEN PALM
    else if (extendedFingers >= 4 && indexToRing > 0.18) {
      gesture = 'open';
      confidence = 0.89;
    }
    // PINCH
    else if (thumbToIndex < 0.05 && middleHeight > 0.1) {
      gesture = 'pinch';
      confidence = 0.87;
    }

    return { gesture, confidence, position: { x: handX, y: handY } };
  };

  // Request camera
  const requestCameraAccess = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      const constraints = {
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef_.current) {
        videoRef_.current.srcObject = stream;
        videoRef_.current.onloadedmetadata = () => {
          videoRef_.current?.play().catch(e => console.warn('Video play error:', e));
        };
      }

      isInitializedRef.current = true;
      setIsInitialized(true);
      processFrame();
    } catch (error: any) {
      console.error('Camera error:', error);
      isInitializedRef.current = false;
    }
  }, [videoRef_]);

  // Process frames
  const processFrame = useCallback(() => {
    if (!isInitializedRef.current || !videoRef_.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      if (canvasRef_.current && videoRef_.current.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
        const ctx = canvasRef_.current.getContext('2d');
        if (ctx) {
          canvasRef_.current.width = videoRef_.current.videoWidth;
          canvasRef_.current.height = videoRef_.current.videoHeight;
          ctx.drawImage(videoRef_.current, 0, 0);
        }
      }

      detectionCountRef.current++;
      if (detectionCountRef.current % 3 === 0) {
        const hand = simulateHandDetection();
        if (hand) {
          const result = detectGesture(hand);
          if (result.gesture && result.confidence >= GESTURE_CONFIDENCE_THRESHOLD) {
            const now = Date.now();
            if (now - lastGestureTimeRef.current > GESTURE_DEBOUNCE_MS) {
              lastGestureTimeRef.current = now;
              lastGestureRef.current = result.gesture;
              onGestureDetected({
                gesture: result.gesture,
                isDetected: true,
                confidence: result.confidence,
                handPosition: result.position
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Frame error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [videoRef_, canvasRef_, onGestureDetected, detectGesture]);

  // Simulate hand detection
  const simulateHandDetection = (): any => {
    if (!canvasRef_.current) return null;
    try {
      const ctx = canvasRef_.current.getContext('2d');
      if (!ctx) return null;

      const imageData = ctx.getImageData(0, 0, canvasRef_.current.width, canvasRef_.current.height);
      const data = imageData.data;
      let skinPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 95 && g > 40 && b > 20 && r > g && r > b) skinPixels++;
      }

      if (skinPixels > 100) {
        return { keypoints: generateMockLandmarks(canvasRef_.current.width, canvasRef_.current.height) };
      }
    } catch (error) {
      console.error('Hand detection error:', error);
    }
    return null;
  };

  // Generate landmarks
  const generateMockLandmarks = (width: number, height: number): any[] => {
    const landmarks = [];
    for (let i = 0; i < 21; i++) {
      const angle = (i / 21) * Math.PI * 2;
      const radius = 50 + Math.sin(i * 0.5) * 30;
      landmarks.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius
      });
    }
    return landmarks;
  };

  const initialize = useCallback(async () => {
    await requestCameraAccess();
  }, [requestCameraAccess]);

  const destroy = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    isInitializedRef.current = false;
    setIsInitialized(false);
  }, []);

  useEffect(() => {
    initialize();
    return () => destroy();
  }, [initialize, destroy]);

  return {
    videoRef: videoRef_,
    gestureState: {
      gesture: lastGestureRef.current,
      isDetected: lastGestureRef.current !== null,
      confidence: 0.85
    },
    isInitialized,
    initialize,
    destroy,
    handDetected: lastGestureRef.current !== null
  };
};
