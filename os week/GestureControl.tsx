import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFUpload } from '@/components/PDFUpload';
import { ThumbnailStrip } from '@/components/ThumbnailStrip';
import { PresentationTimer } from '@/components/PresentationTimer';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Zap,
  X,
  Trash2,
  RotateCcw,
  RotateCw,
  Highlighter,
  Pen,
  Download,
  Save,
  Volume2,
  Video,
  VideoOff,
  Clock,
} from 'lucide-react';
import { HandGestureCamera } from '@/camera/HandGestureCamera';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

interface GestureControlProps {
  onPlay?: () => void;
  onPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  isEnabled?: boolean;
}

type DrawMode = 'none' | 'pen' | 'highlighter' | 'box' | 'circle' | 'arrow';

export const GestureControl: React.FC<GestureControlProps> = ({
  onPlay,
  onPause,
  onSkipBack,
  onSkipForward,
  isEnabled = true,
}) => {
  // Core state
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [isBlankScreen, setIsBlankScreen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [zoom, setZoom] = useState(1);
  const [laserPointerActive, setLaserPointerActive] = useState(false);

  // Drawing canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const renderTaskRef = useRef<any>(null);

  // Camera and gesture state
  const [showCamera, setShowCamera] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [autoAdvanceTime, setAutoAdvanceTime] = useState<number | null>(null);

  // Initialize PDF.js
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
  }, []);

  // Cleanup render tasks on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, []);

  // Handle PDF upload
  const handlePdfUpload = async (file: File) => {
    setPdfFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setTotalSlides(pdf.numPages);
    setCurrentSlide(1);
    await renderPage(1, pdf);
  };

  // Render PDF page
  const renderPage = async (page: number, pdf?: any) => {
    const doc = pdf || pdfDoc;
    if (!doc || !pdfCanvasRef.current) return;

    try {
      // Cancel previous render task if it exists
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const pdfPage = await doc.getPage(page);
      const scale = zoom;
      const viewport = pdfPage.getViewport({ scale });
      const canvas = pdfCanvasRef.current;
      
      // Clear canvas
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render page and store the task
        renderTaskRef.current = pdfPage.render({
          canvasContext: context,
          viewport: viewport,
        });
        
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
      }
    } catch (error: any) {
      // Silently ignore cancellation errors
      if (error.name !== 'RenderingCancelledError') {
        console.error('Error rendering page:', error);
      }
    }
  };

  // Handle slide navigation
  const handleNextSlide = () => {
    if (currentSlide < totalSlides) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      renderPage(newSlide);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 1) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      renderPage(newSlide);
    }
  };

  const handleGoToSlide = (slide: number) => {
    if (slide >= 1 && slide <= totalSlides) {
      setCurrentSlide(slide);
      renderPage(slide);
    }
  };

  // Auto-advance slides when playing with selected time interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && autoAdvanceTime) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev < totalSlides) {
            return prev + 1;
          } else {
            // Stop playing when reaching the last slide
            setIsPlaying(false);
            return prev;
          }
        });
      }, autoAdvanceTime * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, autoAdvanceTime, totalSlides]);

  // Re-render on slide change or zoom
  useEffect(() => {
    renderPage(currentSlide);
  }, [currentSlide, zoom, pdfDoc]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700">
        <h1 className="text-2xl font-bold">📊 Presentation Control</h1>
        <div className="flex gap-4 items-center">
          <PresentationTimer />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-auto">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col gap-4">
          {!pdfFile ? (
            <Card className="flex-1 flex items-center justify-center bg-slate-700 border-slate-600">
              <CardContent>
                <PDFUpload onFileSelected={handlePdfUpload} />
              </CardContent>
            </Card>
          ) : isBlankScreen ? (
            <Card className="flex-1 bg-black border-slate-600 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">BLANK</h2>
                <p className="text-slate-400">Press "Show" to resume</p>
              </div>
            </Card>
          ) : (
            <Card className="flex-1 bg-slate-700 border-slate-600 overflow-auto flex items-center justify-center">
              <canvas
                ref={pdfCanvasRef}
                className="max-w-full max-h-full"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </Card>
          )}

          {/* Slide Navigation */}
          <div className="flex gap-2 items-center bg-slate-700 p-3 rounded-lg border border-slate-600">
            <Button onClick={handlePreviousSlide} disabled={currentSlide === 1} variant="outline" size="sm">
              <SkipBack size={18} />
            </Button>
            <div className="flex-1 text-center font-mono">
              Slide {currentSlide} / {totalSlides}
            </div>
            <Button onClick={handleNextSlide} disabled={currentSlide === totalSlides} variant="outline" size="sm">
              <SkipForward size={18} />
            </Button>
          </div>

          {/* Thumbnail Strip */}
          {pdfDoc && (
            <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
              <ThumbnailStrip
                totalSlides={totalSlides}
                currentSlide={currentSlide}
                onSlideSelect={handleGoToSlide}
              />
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="w-72 flex flex-col gap-4">
          {/* Playback Controls */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 size={18} />
                Playback
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="relative">
                <Button
                  onClick={() => {
                    if (isPlaying) {
                      // If already playing, toggle pause/play
                      setIsPlaying(false);
                      setShowTimeSelector(false);
                    } else {
                      // If not playing, show time selector
                      setShowTimeSelector(!showTimeSelector);
                    }
                  }}
                  variant="default"
                  className="w-full"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  {isPlaying ? 'Pause' : 'Play'}
                  {autoAdvanceTime && <span className="ml-2">({autoAdvanceTime}s)</span>}
                </Button>
                {showTimeSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-600 border border-slate-500 rounded-lg p-2 flex flex-col gap-2 z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAutoAdvanceTime(3);
                        setIsPlaying(true);
                        setShowTimeSelector(false);
                        onPlay?.();
                      }}
                      className="w-full flex gap-2"
                    >
                      <Clock size={16} /> 3 sec
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAutoAdvanceTime(5);
                        setIsPlaying(true);
                        setShowTimeSelector(false);
                        onPlay?.();
                      }}
                      className="w-full flex gap-2"
                    >
                      <Clock size={16} /> 5 sec
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAutoAdvanceTime(7);
                        setIsPlaying(true);
                        setShowTimeSelector(false);
                        onPlay?.();
                      }}
                      className="w-full flex gap-2"
                    >
                      <Clock size={16} /> 7 sec
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={handlePreviousSlide} variant="outline" className="w-full">
                <SkipBack size={18} /> Previous
              </Button>
              <Button onClick={handleNextSlide} variant="outline" className="w-full">
                <SkipForward size={18} /> Next
              </Button>
              <Button
                onClick={() => setShowCamera(!showCamera)}
                variant={showCamera ? 'default' : 'outline'}
                className="w-full gap-2"
              >
                {showCamera ? <Video size={18} /> : <VideoOff size={18} />}
                {showCamera ? 'Camera On' : 'Camera Off'}
              </Button>
            </CardContent>
          </Card>

          {/* Drawing Tools */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pen size={18} />
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                onClick={() => setDrawMode(drawMode === 'pen' ? 'none' : 'pen')}
                variant={drawMode === 'pen' ? 'default' : 'outline'}
                className="w-full"
              >
                <Pen size={18} /> Pen
              </Button>
              <Button
                onClick={() => setDrawMode(drawMode === 'highlighter' ? 'none' : 'highlighter')}
                variant={drawMode === 'highlighter' ? 'default' : 'outline'}
                className="w-full"
              >
                <Highlighter size={18} /> Highlight
              </Button>
              <Button
                onClick={() => setLaserPointerActive(!laserPointerActive)}
                variant={laserPointerActive ? 'default' : 'outline'}
                className="w-full"
              >
                <Zap size={18} /> Laser
              </Button>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm">
                  Color:
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X size={18} />
                Display
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                onClick={() => setIsBlankScreen(!isBlankScreen)}
                variant={isBlankScreen ? 'default' : 'outline'}
                className="w-full"
              >
                {isBlankScreen ? 'Show' : 'Blank'}
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} variant="outline" size="sm" className="flex-1">
                  −
                </Button>
                <div className="flex-1 text-center text-sm py-2">{Math.round(zoom * 100)}%</div>
                <Button onClick={() => setZoom(Math.min(2, zoom + 0.1))} variant="outline" size="sm" className="flex-1">
                  +
                </Button>
              </div>
              <Button
                onClick={() => setZoom(1)}
                variant="outline"
                className="w-full text-xs"
              >
                Reset Zoom
              </Button>
            </CardContent>
          </Card>

          {/* File Info */}
          {pdfFile && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-sm">File Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <p className="truncate">{pdfFile.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Size:</span>
                  <p>{(pdfFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <span className="text-slate-400">Pages:</span>
                  <p>{totalSlides}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hand Gesture Camera - Only render when camera is toggled on */}
      {showCamera && (
        <div className="fixed top-4 right-4 z-50 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
          <HandGestureCamera
            width={320}
            height={240}
            showOverlay={true}
            onGesture={(gesture) => {
              console.log('Detected gesture:', gesture);
            }}
          />
        </div>
      )}
    </div>
  );
};
