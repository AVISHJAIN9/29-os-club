import React, { useState } from 'react';
import { X, Command } from 'lucide-react';

interface GestureItem {
  gesture: string;
  emoji: string;
  action: string;
  description: string;
  category: 'navigation' | 'drawing' | 'tools' | 'control';
}

const GESTURES: GestureItem[] = [
  // Navigation
  {
    gesture: 'Wipe Right',
    emoji: '👉',
    action: 'Next Slide',
    description: 'Point index finger and flick right to advance',
    category: 'navigation',
  },
  {
    gesture: 'Wipe Left',
    emoji: '👈',
    action: 'Previous Slide',
    description: 'Point index finger and flick left to go back',
    category: 'navigation',
  },
  {
    gesture: 'Pinch In/Out',
    emoji: '🤏',
    action: 'Zoom In/Out',
    description: 'Pinch gesture to zoom into a specific area',
    category: 'navigation',
  },

  // Drawing
  {
    gesture: 'Peace Sign',
    emoji: '✌️',
    action: 'Draw Mode',
    description: 'Switch to annotation/draw mode — finger becomes a pen',
    category: 'drawing',
  },
  {
    gesture: 'Air Pen',
    emoji: '✏️',
    action: 'Freehand Draw',
    description: 'Index finger tracked as pen — draw circles, underlines, arrows',
    category: 'drawing',
  },
  {
    gesture: '3 Fingers Up',
    emoji: '🖐️',
    action: 'Highlighter Mode',
    description: 'Semi-transparent yellow stroke for highlighting text',
    category: 'drawing',
  },
  {
    gesture: '3 Fingers Down',
    emoji: '🤟',
    action: 'Erase Last Annotation',
    description: 'Undo the last drawn annotation instantly',
    category: 'drawing',
  },

  // Tools
  {
    gesture: 'Thumbs Up',
    emoji: '👍',
    action: 'Laser Pointer ON',
    description: 'Activate a red laser dot that follows your fingertip',
    category: 'tools',
  },
  {
    gesture: 'Fist',
    emoji: '✊',
    action: 'Pause / Blank Screen',
    description: 'Close fist to black out the screen (presenter pause)',
    category: 'tools',
  },
  {
    gesture: 'Open Palm',
    emoji: '🖐️',
    action: 'Resume',
    description: 'Open hand to bring the slide back',
    category: 'tools',
  },

  // Control
  {
    gesture: 'Spread Fingers',
    emoji: '✋',
    action: 'Color Switcher',
    description: 'Cycle through red, blue, green, black colors',
    category: 'control',
  },
  {
    gesture: 'All Fingers Spread',
    emoji: '🤲',
    action: 'Clear All Annotations',
    description: 'Wipe gesture (flat hand sweep left) clears all drawings',
    category: 'control',
  },
  {
    gesture: 'OK Sign',
    emoji: '👌',
    action: 'Take Screenshot',
    description: 'Capture current slide as PNG image',
    category: 'control',
  },
];

const categoryColors = {
  navigation: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-300 dark:border-blue-700', badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
  drawing: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-300 dark:border-purple-700', badge: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' },
  tools: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-300 dark:border-red-700', badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' },
  control: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-300 dark:border-green-700', badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
};

interface GestureCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureCheatSheet: React.FC<GestureCheatSheetProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['navigation', 'drawing', 'tools', 'control'] as const;
  const categoryNames = { navigation: 'Navigation', drawing: 'Drawing', tools: 'Tools', control: 'Control' };

  const filteredGestures = selectedCategory
    ? GESTURES.filter((g) => g.category === selectedCategory)
    : GESTURES;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] 
                   overflow-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Command className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Gesture Cheat Sheet</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Filter by category:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === null
                  ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                  selectedCategory === cat
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {categoryNames[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Gestures Grid */}
        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGestures.map((item) => {
              const colors = categoryColors[item.category];
              return (
                <div
                  key={`${item.gesture}-${item.action}`}
                  className={`border-2 rounded-lg p-4 transition hover:shadow-lg ${colors.bg} ${colors.border}`}
                >
                  {/* Emoji + Gesture Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{item.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{item.gesture}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${colors.badge}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <p className="font-semibold text-base text-gray-800 dark:text-gray-200 mb-2">{item.action}</p>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 font-mono">H</kbd> or make a help gesture to toggle this cheat sheet
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestureCheatSheet;
