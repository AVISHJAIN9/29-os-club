import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface GestureConfidenceProps {
  gesture: string | null;
  confidence: number; // 0-1
  isVisible?: boolean;
}

export const GestureConfidenceIndicator: React.FC<GestureConfidenceProps> = ({
  gesture,
  confidence,
  isVisible = true,
}) => {
  const [displayGesture, setDisplayGesture] = useState<string | null>(gesture);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (gesture) {
      setDisplayGesture(gesture);
      setFadeOut(false);

      // Fade out after 1.5 seconds if no new gesture
      const timer = setTimeout(() => {
        setFadeOut(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gesture]);

  if (!isVisible || !displayGesture) return null;

  const confPercentage = Math.round(confidence * 100);
  const isHighConfidence = confidence > 0.75;
  const isMediumConfidence = confidence > 0.5;

  return (
    <div
      className={`fixed top-6 left-6 bg-gray-900/90 dark:bg-gray-950/95 backdrop-blur-md
                  rounded-lg p-4 border border-gray-700 dark:border-gray-600
                  shadow-xl transition-all duration-300
                  ${fadeOut ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}`}
    >
      <div className="flex items-center gap-4 min-w-max">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isHighConfidence ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : isMediumConfidence ? (
            <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">{displayGesture}</p>
          <div className="flex items-center gap-2">
            {/* Progress Bar */}
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  isHighConfidence
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : isMediumConfidence
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${confPercentage}%` }}
              />
            </div>
            {/* Percentage Text */}
            <span
              className={`text-xs font-bold font-mono ${
                isHighConfidence
                  ? 'text-green-400'
                  : isMediumConfidence
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {confPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureConfidenceIndicator;
