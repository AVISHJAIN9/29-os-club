import React, { useState, useEffect, useRef } from 'react';
import { useHandGesture, GestureState } from '@/hooks/use-hand-gesture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFUpload } from '@/components/PDFUpload';
import { ThumbnailStrip } from '@/components/ThumbnailStrip';
import { PresentationTimer } from '@/components/PresentationTimer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WebcamPiP } from '@/components/WebcamPiP';
import { GestureCheatSheet } from '@/components/GestureCheatSheet';
import { GestureConfidenceIndicator } from '@/components/GestureConfidenceIndicator';
import { ToastContainer, useToast } from '@/components/Toast';
import { PresentationHistory, PresentationHistoryItem } from '@/components/PresentationHistory';
import { AnalyticsData, AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Zap,
  X,
  Hand,
  Square,
  Circle,
  ArrowRight,
  Trash2,
  RotateCcw,
  RotateCw,
  Highlighter,
  Pen,
  Download,
  Save,
  BarChart3,
  Clock,
} from 'lucide-react';
import * as DrawingUtils from '@/utils/drawing-utils';
import * as ExportUtils from '@/utils/export-utils';
import { AnalyticsTracker } from '@/utils/analytics-tracker';

interface GestureControlProps {
  onPlay?: () => void;
  onPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  isEnabled?: boolean;
  onPermissionError?: () => void;
}

export const GestureControl: React.FC<GestureControlProps> = ({
  onPlay,
  onPause,
  onSkipBack,
  onSkipForward,
  isEnabled = true,
  onPermissionError,
}) => {
  // FEATURE 21: Toast notifications
  const { toasts, addToast, removeToast } = useToast();

  // Presentation state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Gesture state
  const [lastGesture, setLastGesture] = useState('');
  const [gestureTimeout, setGestureTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentDetectedGesture, setCurrentDetectedGesture] = useState<string | null>(null);
  const [currentConfidence, setCurrentConfidence] = useState(0);

  // Drawing state
  const [drawMode, setDrawMode] = useState<'none' | 'pen' | 'highlighter' | 'box' | 'circle' | 'arrow'>('none');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBlankScreen, setIsBlankScreen] = useState(false);
  const [laserPointerActive, setLaserPointerActive] = useState(false);
  const [laserPosition, setLaserPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // UI state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamPosition, setWebcamPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right');

  // FEATURES 21-26: New features state
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'presentation' | 'history' | 'analytics'>('presentation');
  const [presentationHistory, setPresentationHistory] = useState<PresentationHistoryItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const trackerRef = useRef<AnalyticsTracker | null>(null);
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const prevGestureRef = useRef('');

  // Custom hook
  const { handDetected, gestureState } = useHandGesture(
    videoRef,
    canvasRef,
    isPlaying && showCamera && isEnabled,
  );

  // Initialize analytics tracker
  useEffect(() => {
    if (showCamera && !trackerRef.current) {
      trackerRef.current = new AnalyticsTracker(totalSlides);
    }
  }, [showCamera, totalSlides]);

  // FEATURE 22: Keyboard listener for H key (cheat sheet)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setShowCheatSheet(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCheatSheet]);

  // FEATURE 24: PDF Export handler
  const handleExportPDF = async () => {
    if (!pdfFile) return;

    try {
      addToast('Preparing PDF export...', 'info');
      const fileBuffer = await pdfFile.arrayBuffer();
      const drawings = new Map<number, ImageData>();
      if (drawingCanvasRef.current && historyIndex >= 0) {
        const ctx = drawingCanvasRef.current.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
          drawings.set(currentSlide, imageData);
        }
      }
      await ExportUtils.exportAnnotatedPDF(fileBuffer, drawings, `presentation-annotated-${Date.now()}.pdf`);
      addToast('PDF exported successfully!', 'success', 3000);
    } catch (error) {
      console.error('PDF export error:', error);
      addToast('Failed to export PDF', 'error', 3000);
    }
  };

  // Gesture handler
  const handleGestureDetected = (state: GestureState) => {
    if (!state.gesture || prevGestureRef.current === state.gesture) return;

    // FEATURE 23: Update confidence indicator
    setCurrentDetectedGesture(state.gesture);
    setCurrentConfidence(state.confidence);

    // Track in analytics
    if (trackerRef.current) {
      const emojiMap: { [key: string]: string } = {
        'wipe-right': '👉',
        'wipe-left': '👈',
        fist: '✊',
        peace: '✌️',
        'thumbs-up': '👍',
        pinch: '🤏',
        open: '🖐️',
      };
      trackerRef.current.recordGesture(
        state.gesture,
        emojiMap[state.gesture] || '👋',
        state.confidence,
        state.handPosition,
      );
    }

    prevGestureRef.current = state.gesture;

    let gestureAction = '';

    switch (state.gesture) {
      case 'wipe-right':
        if (currentSlide < totalSlides - 1) {
          setCurrentSlide((s) => s + 1);
          gestureAction = 'Next Slide →';
        }
        break;

      case 'wipe-left':
        if (currentSlide > 0) {
          setCurrentSlide((s) => s - 1);
          gestureAction = 'Previous Slide ←';
        }
        break;

      case 'fist':
        setIsBlankScreen(!isBlankScreen);
        gestureAction = isBlankScreen ? 'Show Slide' : 'Blank Screen';
        break;

      case 'open':
        if (isBlankScreen) {
          setIsBlankScreen(false);
          gestureAction = 'Resumed';
        }
        break;

      case 'peace':
        setDrawMode(drawMode === 'pen' ? 'none' : 'pen');
        gestureAction = drawMode === 'pen' ? 'Draw Mode OFF' : 'Draw Mode ON';
        break;

      case 'thumbs-up':
        setLaserPointerActive(!laserPointerActive);
        gestureAction = laserPointerActive ? 'Laser OFF' : 'Laser ON ▲';
        break;

      case 'pinch':
        setZoom((z) => Math.min(z + 0.1, 2));
        gestureAction = `Zoom +`;
        break;

      case 'three-fingers':
        if (drawMode !== 'none') {
          handleUndo();
          gestureAction = 'Erased';
        }
        break;
    }

    if (gestureAction) {
      setLastGesture(gestureAction);

      // FEATURE 21: Toast notifications on gesture
      addToast(gestureAction, 'success', 2000);

      if (gestureTimeout) clearTimeout(gestureTimeout);
      const timeout = setTimeout(() => {
        setLastGesture('');
        setCurrentDetectedGesture(null);
        prevGestureRef.current = '';
      }, 1500);
      setGestureTimeout(timeout);

      onSkipForward?.();
    }
  };

  // FEATURE 25: Save session to history
  const handleSaveSession = () => {
    if (!pdfFile) return;

    const historyItem: PresentationHistoryItem = {
      id: `session-${Date.now()}`,
      title: pdfFile.name.replace('.pdf', ''),
      date: new Date(),
      duration: trackerRef.current ? Math.round(trackerRef.current.getDuration() / 60) : 0,
      slideCount: totalSlides,
      gestures: trackerRef.current?.getStats().totalGestures || 0,
      annotations: trackerRef.current?.getStats().totalAnnotations || 0,
      slides: drawingHistory,
    };

    setPresentationHistory((prev) => [historyItem, ...prev]);
    addToast('Session saved to history!', 'success', 3000);
  };

  // FEATURE 26: Generate analytics
  const handleGenerateAnalytics = () => {
    if (!trackerRef.current) return;

    const stats = trackerRef.current.getStats();
    const gesturesByType: Record<string, number> = {
      navigation: 0,
      drawing: 0,
      tools: 0,
      control: 0,
    };

    stats.gestureRecords.forEach((record) => {
      const type = {
        'wipe-right': 'navigation',
        'wipe-left': 'navigation',
        pinch: 'navigation',
        peace: 'drawing',
        'three-fingers': 'drawing',
        'thumbs-up': 'tools',
        fist: 'control',
        open: 'control',
      }[record.gesture] || 'control';

      if (type in gesturesByType) {
        gesturesByType[type]++;
      }
    });

    const analytics: AnalyticsData = {
      totalGestures: stats.totalGestures,
      presentationDuration: trackerRef.current.getDuration(),
      slideCount: stats.slideCount,
      gestures: Array.from(stats.gesturesByName.entries()).map(([name, count]) => ({
        gestureName: name,
        count,
        confidence: stats.averageConfidence,
        emoji: {
          'wipe-right': '👉',
          'wipe-left': '👈',
          fist: '✊',
          peace: '✌️',
          'thumbs-up': '👍',
          pinch: '🤏',
          open: '🖐️',
        }[name] || '👋',
      })),
      annotationCount: stats.totalAnnotations,
      accuracyRate: stats.averageConfidence,
      gesturesByType,
    };

    setAnalyticsData(analytics);
    setActiveTab('analytics');
    addToast('Analytics generated!', 'success', 3000);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      const canvas = drawingCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && drawingHistory[historyIndex - 1]) {
          ctx.putImageData(drawingHistory[historyIndex - 1], 0, 0);
        }
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < drawingHistory.length - 1) {
      setHistoryIndex((i) => i + 1);
      const canvas = drawingCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && drawingHistory[historyIndex + 1]) {
          ctx.putImageData(drawingHistory[historyIndex + 1], 0, 0);
        }
      }
    }
  };

  const clearDrawingCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setDrawingHistory([]);
        setHistoryIndex(-1);
        trackerRef.current?.recordAnnotation('erase', currentSlide);
        addToast('Canvas cleared', 'info', 2000);
      }
    }
  };

  const drawShape = (shape: 'box' | 'circle' | 'arrow') => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = 60;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;

    switch (shape) {
      case 'box':
        ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'arrow':
        DrawingUtils.drawArrow(ctx, centerX - 30, centerY, centerX + 30, centerY, currentColor);
        break;
    }

    setHistoryIndex((i) => i + 1);
    if (drawingCanvasRef.current) {
      setDrawingHistory((h) => [
        ...h.slice(0, historyIndex + 1),
        ctx.getImageData(0, 0, canvas.width, canvas.height),
      ]);
    }
    trackerRef.current?.recordAnnotation('shape', currentSlide);
    addToast(`Shape added`, 'success', 2000);
  };

  // Camera setup
  useEffect(() => {
    if (!showCamera) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraAccess(true);
          setIsPlaying(true);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Camera permission denied';
        setCameraError(errorMsg);
        onPermissionError?.();
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera, onPermissionError]);

  useEffect(() => {
    if (gestureState && isPlaying) {
      handleGestureDetected(gestureState);
    }
  }, [gestureState, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 640;
    canvas.height = 480;
  }, []);

  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');
    if (ctx && drawingHistory[historyIndex]) {
      ctx.putImageData(drawingHistory[historyIndex], 0, 0);
    }
  }, [historyIndex, drawingHistory]);

  useEffect(() => {
    if (!drawingCanvasRef.current || drawMode === 'none') return;

    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startDrawing = (e: MouseEvent) => {
      isDrawingRef.current = true;
      const rect = canvas.getBoundingClientRect();
      lastPositionRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawingRef.current || drawMode === 'none') return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (drawMode === 'pen') {
        DrawingUtils.drawPen(ctx, lastPositionRef.current.x, lastPositionRef.current.y, x, y, currentColor);
      } else if (drawMode === 'highlighter') {
        DrawingUtils.drawHighlighter(ctx, lastPositionRef.current.x, lastPositionRef.current.y, x, y);
      }

      lastPositionRef.current = { x, y };
    };

    const stopDrawing = () => {
      isDrawingRef.current = false;
      if (historyIndex < drawingHistory.length - 1) {
        setDrawingHistory((h) => h.slice(0, historyIndex + 1));
      }
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawingHistory((h) => [...h, imageData]);
      setHistoryIndex((i) => i + 1);
      trackerRef.current?.recordAnnotation(drawMode === 'highlighter' ? 'highlight' : 'draw', currentSlide);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, [drawMode, currentColor, historyIndex, drawingHistory]);

  useEffect(() => {
    if (!laserPointerActive || !gestureState?.handPosition) return;

    const slideDisplay = document.getElementById('slide-display');
    if (slideDisplay) {
      const rect = slideDisplay.getBoundingClientRect();
      setLaserPosition({
        x: gestureState.handPosition.x * rect.width,
        y: gestureState.handPosition.y * rect.height,
      });
    }
  }, [laserPointerActive, gestureState]);

  if (!pdfFile) {
    return <PDFUpload />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* FEATURE 21: Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* FEATURE 22: Gesture Cheat Sheet Modal */}
      <GestureCheatSheet isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} />

      {/* FEATURE 23: Gesture Confidence Indicator */}
      <GestureConfidenceIndicator gesture={currentDetectedGesture} confidence={currentConfidence} isVisible={showCamera} />

      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2 z-30 shadow-sm">
        <button
          onClick={() => setActiveTab('presentation')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'presentation'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          Presentation
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          History ({presentationHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Presentation Tab */}
      {activeTab === 'presentation' && (
        <div className="p-6 space-y-4 pb-20 max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{pdfFile.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSlide + 1} / {totalSlides} slides
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" onClick={() => setPdfFile(null)}>
                  <X className="w-4 h-4 mr-1" />
                  New PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {!showCamera ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <Hand className="w-16 h-16 mx-auto text-blue-500" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Present?</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start gesture control to begin your presentation
                  </p>
                  <Button size="lg" onClick={() => setShowCamera(true)}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Presentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {cameraError && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                  <CardContent className="pt-6">
                    <p className="text-red-800 dark:text-red-200">Camera Error: {cameraError}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div
                    id="slide-display"
                    className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    {isBlankScreen ? (
                      <div className="absolute inset-0 bg-black"></div>
                    ) : (
                      <div className="text-white text-center">
                        <div className="text-6xl font-bold">{currentSlide + 1}</div>
                        <p className="text-xl">Slide {currentSlide + 1} of {totalSlides}</p>
                      </div>
                    )}

                    {drawMode !== 'none' && (
                      <canvas
                        ref={drawingCanvasRef}
                        className="absolute inset-0 cursor-crosshair z-10"
                        style={{ opacity: 0.8 }}
                      />
                    )}

                    {laserPointerActive && (
                      <div
                        className="absolute w-6 h-6 bg-red-500 rounded-full shadow-lg animate-pulse"
                        style={{
                          left: `${laserPosition.x}px`,
                          top: `${laserPosition.y}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 20,
                          boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)',
                        }}
                      />
                    )}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />
                  <video ref={videoRef} className="hidden" autoPlay playsInline />

                  <ThumbnailStrip
                    slides={Array.from({ length: totalSlides }, (_, i) => i)}
                    currentSlide={currentSlide}
                    onSlideSelect={setCurrentSlide}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}>
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 flex items-center justify-center text-sm font-semibold">
                      Slide {currentSlide + 1} / {totalSlides}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setCurrentSlide(Math.min(totalSlides - 1, currentSlide + 1))}>
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  {drawMode !== 'none' && (
                    <div className="bg-muted dark:bg-gray-700 p-3 rounded-lg space-y-3">
                      <div className="text-sm font-semibold">Drawing Tools</div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={drawMode === 'pen' ? 'default' : 'outline'}
                          onClick={() => setDrawMode('pen')}
                          className="flex-1"
                        >
                          <Pen className="w-3 h-3 mr-1" />
                          Pen
                        </Button>
                        <Button
                          size="sm"
                          variant={drawMode === 'highlighter' ? 'default' : 'outline'}
                          onClick={() => setDrawMode('highlighter')}
                          className="flex-1"
                        >
                          <Highlighter className="w-3 h-3 mr-1" />
                          Highlight
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        {DrawingUtils.DEFAULT_COLORS.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border-2 transition-all"
                            style={{
                              backgroundColor: color,
                              borderColor: currentColor === color ? '#fff' : 'transparent',
                            }}
                            onClick={() => setCurrentColor(color)}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => drawShape('box')} className="flex-1">
                          <Square className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => drawShape('circle')} className="flex-1">
                          <Circle className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => drawShape('arrow')} className="flex-1">
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleUndo} disabled={historyIndex <= 0} className="flex-1">
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleRedo} disabled={historyIndex >= drawingHistory.length - 1} className="flex-1">
                          <RotateCw className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={clearDrawingCanvas} className="flex-1 text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleExportPDF} className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Export PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSaveSession} className="flex-1">
                      <Save className="w-4 h-4 mr-1" />
                      Save Session
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleGenerateAnalytics} className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center bg-muted dark:bg-gray-700 p-2 rounded">
                    Press <kbd className="px-1 py-0.5 bg-gray-300 dark:bg-gray-600 rounded text-xs font-mono">H</kbd> for gesture cheat sheet
                  </div>
                </CardContent>
              </Card>

              <PresentationTimer />
              <WebcamPiP visible={showWebcam} onClose={() => setShowWebcam(false)} position={webcamPosition} />
            </>
          )}
        </div>
      )}

      {/* History Tab - FEATURE 25 */}
      {activeTab === 'history' && (
        <div className="p-6 max-w-6xl mx-auto">
          <PresentationHistory
            items={presentationHistory}
            onDelete={(id) => setPresentationHistory((prev) => prev.filter((h) => h.id !== id))}
            onRestore={(item) => {
              addToast(`Restored: ${item.title}`, 'success', 3000);
            }}
            onExport={(item) => {
              ExportUtils.exportSessionAsJSON(
                {
                  title: item.title,
                  slides: item.slideCount,
                  timestamp: item.date.toISOString(),
                  metadata: { gestures: item.gestures, annotations: item.annotations },
                },
                `${item.title}-session.json`
              );
              addToast('Session exported!', 'success', 3000);
            }}
          />
        </div>
      )}

      {/* Analytics Tab - FEATURE 26 */}
      {activeTab === 'analytics' && (
        <div className="p-6 max-w-6xl mx-auto">
          {analyticsData ? (
            <AnalyticsDashboard data={analyticsData} />
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Generate analytics to see detailed presentation insights
                </p>
                <Button onClick={handleGenerateAnalytics}>Generate Analytics</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default GestureControl;
