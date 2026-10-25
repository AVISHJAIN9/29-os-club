import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface GestureGuideProps {
  className?: string;
}

export const GestureGuide: React.FC<GestureGuideProps> = ({ className }) => {
  const gestures = [
    {
      id: 1,
      emoji: '👍',
      gesture: 'THUMBS UP',
      action: 'PLAY',
      description: 'Point thumb upward',
      icon: <Play className="w-6 h-6 text-green-500" />,
      steps: [
        '1. Make a fist with your hand',
        '2. Point your thumb straight UP',
        '3. Keep other fingers closed',
      ],
      color: 'bg-green-50 border-green-200',
    },
    {
      id: 2,
      emoji: '👎',
      gesture: 'THUMBS DOWN',
      action: 'PAUSE',
      description: 'Point thumb downward',
      icon: <Pause className="w-6 h-6 text-red-500" />,
      steps: [
        '1. Make a fist with your hand',
        '2. Point your thumb straight DOWN',
        '3. Keep other fingers closed',
      ],
      color: 'bg-red-50 border-red-200',
    },
    {
      id: 3,
      emoji: '✌️',
      gesture: 'PEACE SIGN',
      action: 'NEXT VIDEO',
      description: 'Two fingers up, palm facing camera',
      icon: <SkipForward className="w-6 h-6 text-blue-500" />,
      steps: [
        '1. Extend your INDEX and MIDDLE fingers',
        '2. Keep them separated (V shape)',
        '3. Other fingers stay folded',
        '4. Palm faces toward camera',
      ],
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 4,
      emoji: '👌',
      gesture: 'OK SIGN',
      action: 'REWIND 10 SEC',
      description: 'Thumb and index finger circle',
      icon: <RotateCcw className="w-6 h-6 text-yellow-500" />,
      steps: [
        '1. Touch your THUMB to INDEX finger',
        '2. Make a circle with thumb and index',
        '3. Other three fingers point UP',
        '4. Hold steady for detection',
      ],
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      id: 5,
      emoji: '🖐️',
      gesture: 'PALM OPEN',
      action: 'FORWARD 10 SEC',
      description: 'All fingers spread wide',
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      steps: [
        '1. Open your hand fully',
        '2. Spread all FIVE fingers apart',
        '3. Keep palm facing camera',
        '4. Fingers should be clearly separated',
      ],
      color: 'bg-orange-50 border-orange-200',
    },
    {
      id: 6,
      emoji: '✊',
      gesture: 'FIST',
      action: 'PLAY / PAUSE TOGGLE',
      description: 'All fingers closed',
      icon: <Play className="w-6 h-6 text-purple-500" />,
      steps: [
        '1. Close all your fingers',
        '2. Make tight fist',
        '3. Thumb can be on top or side',
        '4. First fist = Pause, second fist = Play',
      ],
      color: 'bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="glass-card bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            🖐️ Hand Gesture Guide
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Show these hand signs to your camera to control the video
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gestures.map((g) => (
          <Card
            key={g.id}
            className={`glass-card border-2 overflow-hidden hover:shadow-lg transition-all ${g.color}`}
          >
            <CardContent className="p-4">
              {/* Emoji Label */}
              <div className="text-center mb-3">
                <div className="text-6xl mb-2">{g.emoji}</div>
                <h3 className="font-bold text-lg">{g.gesture}</h3>
              </div>

              {/* Action Badge */}
              <div className="flex items-center justify-between mb-4 bg-white/80 p-2 rounded-lg">
                {g.icon}
                <div className="text-center flex-1">
                  <div className="font-bold text-sm text-foreground">
                    {g.action}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.description}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold mb-2 text-foreground">How to:</div>
                {g.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 text-muted-foreground">
                    <span className="font-bold text-primary min-w-fit">
                      {step.split('.')[0]}
                    </span>
                    <span>{step.split('. ')[1]}</span>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="mt-3 p-2 bg-white/60 rounded text-xs text-muted-foreground border-l-2 border-primary">
                💡 Keep your hand steady and in full view of camera
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Reference */}
      <Card className="glass-card bg-amber-50/30 border-amber-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            ⚡ Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            <div className="text-3xl">👍</div>
            <div className="text-3xl">👎</div>
            <div className="text-3xl">✌️</div>
            <div className="text-3xl">👌</div>
            <div className="text-3xl">🖐️</div>
            <div className="text-3xl">✊</div>
          </div>
          <div className="text-center text-xs mt-3 text-muted-foreground">
            Play • Pause • Next • -10s • +10s • Toggle
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="text-sm">✅ Tips for Best Detection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <div>✓ Make gestures in good lighting (natural light works best)</div>
          <div>✓ Keep hand clearly visible in camera frame</div>
          <div>✓ Hold gesture steady for 1 second</div>
          <div>✓ Don't have anything covering your hands</div>
          <div>✓ Keep hand about 1-2 feet from camera</div>
          <div>✓ Look for the emoji feedback on screen</div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="glass-card border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-sm">🔧 Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <div>
            <strong>Camera not showing?</strong> Check camera permissions in browser settings
          </div>
          <div>
            <strong>Gesture not detected?</strong> Make sure your whole hand is in the frame
          </div>
          <div>
            <strong>Takes too long?</strong> Improve lighting or get closer to camera
          </div>
          <div>
            <strong>Wrong action triggered?</strong> Hold gesture for full 1 second
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
