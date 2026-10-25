import React, { useState } from 'react';
import { Trash2, Download, RotateCcw, Clock, Layers } from 'lucide-react';

export interface PresentationHistoryItem {
  id: string;
  title: string;
  date: Date;
  duration: number;
  slideCount: number;
  gestures: number;
  annotations: number;
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
        <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No presentation history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition hover:shadow-md"
        >
          <div
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                <div className="flex items-center gap-4 mt-2 flex-wrap text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {formatTime(item.date)}
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.slideCount} slides</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{item.gestures} gestures</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{item.annotations} notes</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(item);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Export"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(item);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Restore"
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
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {expandedId === item.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 dark:bg-gray-700">
              <h4 className="font-semibold mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-bold">{item.duration} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Gestures</p>
                  <p className="text-lg font-bold">{(item.gestures / Math.max(1, item.slideCount)).toFixed(1)}</p>
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
