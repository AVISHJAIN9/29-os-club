import { useEffect, useRef, useCallback } from 'react';

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

export const useHandGesture = (
  onGestureDetected: (state: GestureState) => void,
  canvasRef?: React.RefObject<HTMLCanvasElement>,
  videoRef?: React.RefObject<HTMLVideoElement>,
  enabled: boolean = true
) => {
  const videoRefLocal = useRef<HTMLVideoElement>(null);
  const canvasRefLocal = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handDetectorRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const lastGestureRef = useRef<string | null>(null);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectionCountRef = useRef(0);

  const videoRef_ = videoRef || videoRefLocal;
  const canvasRef_ = canvasRef || canvasRefLocal;

  // Enhanced gesture detection with better stability
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

  const getAngle = (p1: number[], p2: number[], p3: number[]): number => {
    if (!p1 || !p2 || !p3) return 0;
    const v1 = [p1[0] - p2[0], p1[1] - p2[1]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1]];
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    if (mag1 === 0 || mag2 === 0) return 0;
    return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * (180 / Math.PI);
  };

  const detectGesture = (hand: any): { gesture: string; confidence: number; position: { x: number; y: number } } => {
    const landmarks = getHandLandmarks(hand);
    
    if (Object.keys(landmarks).length < 21) {
      return { gesture: '', confidence: 0, position: { x: 0, y: 0 } };
    }

    // Key positions
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const indexMCP = landmarks[5];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];

    const handX = wrist[0];
    const handY = wrist[1];

    // Calculate distances
    const thumbToIndex = getDistance(thumbTip, indexTip);
    const thumbToMiddle = getDistance(thumbTip, middleTip);
    const indexToMiddle = getDistance(indexTip, middleTip);
    const indexToRing = getDistance(indexTip, ringTip);
    const thumbToWrist = getDistance(thumbTip, wrist);
    const indexToWrist = getDistance(indexTip, wrist);
    const middleToWrist = getDistance(middleTip, wrist);

    // Calculate finger heights (relative to wrist)
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

    // PEACE SIGN (✌️) - Index and middle extended, ring and pinky closed
    if (
      indexHeight > 0.12 && 
      middleHeight > 0.12 && 
      ringHeight < 0.05 && 
      pinkyHeight < 0.05 &&
      indexToMiddle < 0.15 &&
      getDistance(indexTip, middleTip) > 0.03
    ) {
      gesture = 'peace';
      confidence = 0.92;
    }
    // THUMBS UP - Thumb extended upward, fingers curled
    else if (
      thumbHeight > 0.18 &&
      indexHeight < 0.08 &&
      middleHeight < 0.08 &&
      ringHeight < 0.08 &&
      pinkyHeight < 0.08 &&
      extendedFingers <= 1
    ) {
      gesture = 'thumbs-up';
      confidence = 0.90;
    }
    // THUMBS DOWN - Thumb pointing down, fingers curled
    else if (
      thumbHeight < -0.15 &&
      indexHeight < 0.08 &&
      middleHeight < 0.08 &&
      ringHeight < 0.08 &&
      pinkyHeight < 0.08
    ) {
      gesture = 'thumbs-down';
      confidence = 0.88;
    }
    // FIST - All fingers closed
    else if (
      extendedFingers === 0 &&
      closedFingers >= 3 &&
      thumbToIndex < 0.15 &&
      indexToMiddle < 0.12
    ) {
      gesture = 'fist';
      confidence = 0.91;
    }
    // OPEN PALM - All fingers extended, spread apart
    else if (
      extendedFingers >= 4 &&
      indexToRing > 0.18 &&
      thumbHeight > 0 &&
      thumbToIndex > 0.15
    ) {
      gesture = 'open';
      confidence = 0.89;
    }
    // PINCH - Thumb and index very close
    else if (
      thumbToIndex < 0.05 &&
      middleHeight > 0.1 &&
      ringHeight < 0.05
    ) {
      gesture = 'pinch';
      confidence = 0.87;
    }
    // THREE FINGERS - Index, middle, ring extended, pinky closed
    else if (
      indexHeight > 0.1 &&
      middleHeight > 0.1 &&
      ringHeight > 0.1 &&
      pinkyHeight < 0.05
    ) {
      gesture = 'three-fingers';
      confidence = 0.83;
    }

    return { 
      gesture, 
      confidence,
      position: { x: handX, y: handY }
    };
  };

  // Request camera access
  const requestCameraAccess = useCallback(async () => {
    if (!enabled || isInitializedRef.current) return;

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef_.current) {
        videoRef_.current.srcObject = stream;
        // Wait for video to load
        videoRef_.current.onloadedmetadata = () => {
          videoRef_.current?.play().catch(err => {
            console.warn('Video play error:', err);
          });
        };
      }

      isInitializedRef.current = true;

      // Start detection loop
      processFrame();
    } catch (error: any) {
      console.error('Camera access error:', error);
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access.'
        : error.name === 'NotFoundError'
        ? 'No camera found. Please connect a camera.'
        : `Camera error: ${error.message}`;

      onGestureDetected({
        gesture: null,
        isDetected: false,
        confidence: 0,
        handPosition: { x: 0, y: 0 }
      });
    }
  }, [enabled, videoRef_, onGestureDetected]);

  // Main frame processing loop
  const processFrame = useCallback(() => {
    if (!enabled || !videoRef_.current || videoRef_.current.paused) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      // Draw video to canvas for processing
      if (canvasRef_.current) {
        const ctx = canvasRef_.current.getContext('2d', { willReadFrequently: true });
        if (ctx && videoRef_.current) {
          canvasRef_.current.width = videoRef_.current.videoWidth;
          canvasRef_.current.height = videoRef_.current.videoHeight;
          ctx.drawImage(videoRef_.current, 0, 0);
        }
      }

      // Simulate hand detection (in production, use MediaPipe or TensorFlow)
      // This is a placeholder for basic gesture detection
      detectionCountRef.current++;
      
      // Every 5 frames, try to detect gestures
      if (detectionCountRef.current % 3 === 0) {
        const simulatedHand = simulateHandDetection();
        if (simulatedHand) {
          const result = detectGesture(simulatedHand);
          
          if (result.gesture && result.confidence >= GESTURE_CONFIDENCE_THRESHOLD) {
            if (lastGestureRef.current !== result.gesture) {
              lastGestureRef.current = result.gesture;
              
              onGestureDetected({
                gesture: result.gesture,
                isDetected: true,
                confidence: result.confidence,
                handPosition: result.position
              });

              // Clear gesture after timeout
              if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
              gestureTimeoutRef.current = setTimeout(() => {
                lastGestureRef.current = null;
              }, 500);
            }
          }
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [enabled, videoRef_, canvasRef_, onGestureDetected, detectGesture]);

  // Simulate hand detection from canvas (simplified version)
  const simulateHandDetection = (): any => {
    if (!canvasRef_.current) return null;

    try {
      const ctx = canvasRef_.current.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvasRef_.current.width, canvasRef_.current.height);
      const data = imageData.data;

      // Find skin-colored regions (simplified)
      let skinPixels = 0;
      const threshold = 50;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin detection heuristic
        if (r > 95 && g > 40 && b > 20 && 
            r > g && r > b &&
            Math.abs(r - g) > 15) {
          skinPixels++;
        }
      }

      // If we find skin regions, generate mock hand landmarks
      if (skinPixels > 100) {
        const mockHand = {
          keypoints: generateMockLandmarks(canvasRef_.current.width, canvasRef_.current.height)
        };
        return mockHand;
      }
    } catch (error) {
      console.error('Hand detection simulation error:', error);
    }

    return null;
  };

  // Generate mock landmarks for demonstration
  const generateMockLandmarks = (width: number, height: number): any[] => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // This creates a basic hand shape for testing
    const landmarks = [];
    for (let i = 0; i < 21; i++) {
      const angle = (i / 21) * Math.PI * 2;
      const radius = 50 + Math.sin(i * 0.5) * 30;
      landmarks.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    return landmarks;
  };

  // Initialize on mount
  useEffect(() => {
    if (enabled && !isInitializedRef.current) {
      requestCameraAccess();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, [enabled, requestCameraAccess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    handDetected: lastGestureRef.current !== null,
    gestureState: {
      gesture: lastGestureRef.current,
      isDetected: lastGestureRef.current !== null,
      confidence: 0.8
    }
  };
};
