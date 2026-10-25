import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface PresentationTimerProps {
  onDurationChange?: (duration: number) => void;
}

export const PresentationTimer: React.FC<PresentationTimerProps> = ({ onDurationChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0); // seconds
  const [totalTime, setTotalTime] = useState(30 * 60); // 30 minutes default
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && duration < totalTime) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, duration, totalTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = totalTime - duration;
  const isWarning = remainingTime < 5 * 60; // Last 5 minutes
  const isAlert = remainingTime < 1 * 60; // Last 1 minute

  return (
    <Card className="glass-card fixed bottom-4 right-4 p-3 max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <div className={`text-lg font-mono font-bold ${
            isAlert ? 'text-red-500 animate-pulse' : isWarning ? 'text-yellow-500' : 'text-white'
          }`}>
            {formatTime(remainingTime)}
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsRunning(!isRunning)}
            className="p-1"
          >
            {isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDuration(0);
              setIsRunning(false);
            }}
            className="p-1"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">Total Time (minutes)</label>
            <input
              type="number"
              min="1"
              max="180"
              value={Math.floor(totalTime / 60)}
              onChange={(e) => setTotalTime(parseInt(e.target.value) * 60)}
              disabled={isRunning}
              className="w-full px-2 py-1 rounded bg-gray-700 text-white text-sm"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Elapsed: {formatTime(duration)}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-muted-foreground hover:text-white mt-2"
      >
        {isExpanded ? 'Hide' : 'Settings'}
      </button>
    </Card>
  );
};
