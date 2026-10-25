import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface WebcamPiPProps {
  visible?: boolean;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export const WebcamPiP: React.FC<WebcamPiPProps> = ({
  visible = false,
  onClose,
  position = 'top-right',
  size = 'medium',
  videoRef: externalVideoRef,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  // Expose internal video ref to external ref
  useEffect(() => {
    if (externalVideoRef && webcamRef.current?.video) {
      try {
        const videoElement = webcamRef.current.video as HTMLVideoElement;
        (externalVideoRef as any).current = videoElement;
        console.log('✅ Linked react-webcam video to external ref');
      } catch (e) {
        console.warn('Could not link external ref:', e);
      }
    }
  }, [externalVideoRef]);

  // Handle camera ready state
  const handleUserMedia = useCallback(() => {
    console.log('✅ Camera initialized via react-webcam');
    setIsInitialized(true);
    setCameraPermission('granted');
    setError(null);
  }, []);

  const handleUserMediaError = useCallback((error: any) => {
    console.error('❌ Camera error:', error);
    setError(error.message || 'Failed to access camera');
    setCameraPermission('denied');
    setIsInitialized(false);
  }, []);

  const videoConstraints = {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  if (!visible) return null;

  const sizeClasses = {
    small: 'w-32 h-24',
    medium: 'w-48 h-36',
    large: 'w-64 h-48',
  };

  const expandedSizeClasses = {
    small: 'w-96 h-72',
    medium: 'w-screen h-screen',
    large: 'w-screen h-screen',
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700 transition-all duration-300 ${
        isExpanded ? expandedSizeClasses[size] : sizeClasses[size]
      }`}
    >
      <div className="relative w-full h-full bg-black">
        {cameraPermission === 'pending' || cameraPermission === 'denied' ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
            <p className="text-sm">
              {error ? 'Camera access denied' : 'Loading camera...'}
            </p>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
            mirrored={true}
          />
        )}

        {/* Controls */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Status */}
        <div className="absolute bottom-2 left-2">
          <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
            {isInitialized ? '🔴 Live' : 'Initializing...'}
          </div>
        </div>
      </div>
    </div>
  );
};
