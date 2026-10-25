import React, { useState, useEffect } from 'react';
import { Trash2, Download, RotateCcw, Clock, Layers } from 'lucide-react';

export interface PresentationHistoryItem {
  id: string;
  title: string;
  date: Date;
  duration: number; // in minutes
  slideCount: number;
  gestures: number; // Total gestures made
  annotations: number; // Total annotations
  slides: ImageData[];
}

interface PresentationHistoryProps {
  items: PresentationHistoryItem[];
  onDelete: (id: string) => void;
  onRestore: (item: PresentationHistoryItem) => void;
  onExport: (item: PresentationHistoryItem) => void;
}

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
};

export const PresentationHistory: React.FC<PresentationHistoryProps> = ({
  items,
  onDelete,
  onRestore,
  onExport,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No presentation history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                     rounded-lg overflow-hidden transition hover:shadow-md"
        >
          {/* Item Header */}
          <div
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatTime(item.date)}
                  </div>
                  <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {item.slideCount} slides
                  </span>
                  <span className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                    {item.gestures} gestures
                  </span>
                  <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    {item.annotations} annotations
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(item);
                  }}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                  title="Export"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(item);
                  }}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                  title="Restore session"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${item.title}"?`)) {
                      onDelete(item.id);
                    }
                  }}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expansion Panel */}
          {expandedId === item.id && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Slide Thumbnails</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {item.slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] bg-gray-200 dark:bg-gray-600 rounded border-2 border-gray-300 dark:border-gray-500
                             overflow-hidden hover:border-blue-500 transition cursor-pointer group"
                    title={`Slide ${idx + 1}`}
                  >
                    <canvas
                      width={slide.width}
                      height={slide.height}
                      className="w-full h-full group-hover:opacity-75 transition"
                      ref={(canvas) => {
                        if (canvas) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) ctx.putImageData(slide, 0, 0);
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 
                                  bg-black/40 transition pointer-events-none">
                      <span className="text-white font-semibold text-sm">{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistics */}
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Gestures/Slide</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(item.gestures / item.slideCount).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Annotations/Slide</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(item.annotations / item.slideCount).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Annotation Density</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {((item.annotations / item.slideCount) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PresentationHistory;
