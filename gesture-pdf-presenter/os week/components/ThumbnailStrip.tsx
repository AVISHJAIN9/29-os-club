import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ThumbnailStripProps {
  totalSlides: number;
  currentSlide: number;
  onSlideSelect: (slideIndex: number) => void;
  slideTitles?: string[];
}

export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  totalSlides,
  currentSlide,
  onSlideSelect,
  slideTitles = [],
}) => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleThumbnails = 5;
  const maxScroll = Math.max(0, totalSlides - visibleThumbnails);

  const handleScroll = (direction: 'left' | 'right') => {
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - 1)
      : Math.min(maxScroll, scrollPosition + 1);
    setScrollPosition(newPosition);
  };

  return (
    <div className="bg-muted dark:bg-gray-800 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">Slide Thumbnails</p>
        <p className="text-xs text-muted-foreground">{currentSlide} / {totalSlides}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll('left')}
          disabled={scrollPosition === 0}
          className="p-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div
          ref={containerRef}
          className="flex gap-2 overflow-hidden flex-1"
        >
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSlideSelect(idx + 1)}
              className={`flex-shrink-0 w-16 h-20 rounded-lg border-2 transition-all ${
                idx + 1 === currentSlide
                  ? 'border-orange-500 bg-orange-500/20'
                  : 'border-gray-400 dark:border-gray-600 hover:border-orange-400'
              }`}
              style={{
                transform: `translateX(-${scrollPosition * 72}px)`,
              }}
              title={slideTitles[idx] || `Slide ${idx + 1}`}
            >
              <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                {idx + 1}
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll('right')}
          disabled={scrollPosition >= maxScroll}
          className="p-1"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
