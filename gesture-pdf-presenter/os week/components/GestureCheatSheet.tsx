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
  { gesture: 'Wipe Right', emoji: '👉', action: 'Next Slide', description: 'Point index finger and flick right to advance', category: 'navigation' },
  { gesture: 'Wipe Left', emoji: '👈', action: 'Previous Slide', description: 'Point index finger and flick left to go back', category: 'navigation' },
  { gesture: 'Pinch In/Out', emoji: '🤏', action: 'Zoom In/Out', description: 'Pinch gesture to zoom into a specific area', category: 'navigation' },
  { gesture: 'Peace Sign', emoji: '✌️', action: 'Draw Mode', description: 'Switch to annotation/draw mode', category: 'drawing' },
  { gesture: 'Air Pen', emoji: '✏️', action: 'Freehand Draw', description: 'Index finger tracked as pen', category: 'drawing' },
  { gesture: '3 Fingers Up', emoji: '🖐️', action: 'Highlighter Mode', description: 'Semi-transparent yellow stroke', category: 'drawing' },
  { gesture: '3 Fingers Down', emoji: '🤟', action: 'Erase Last', description: 'Undo the last drawn annotation', category: 'drawing' },
  { gesture: 'Thumbs Up', emoji: '👍', action: 'Laser Pointer', description: 'Activate red laser dot', category: 'tools' },
  { gesture: 'Fist', emoji: '✊', action: 'Pause/Blank', description: 'Black out the screen', category: 'tools' },
  { gesture: 'Open Palm', emoji: '🖐️', action: 'Resume', description: 'Bring slide back', category: 'tools' },
  { gesture: 'Spread Fingers', emoji: '✋', action: 'Color Switcher', description: 'Cycle through colors', category: 'control' },
  { gesture: 'All Fingers', emoji: '🤲', action: 'Clear All', description: 'Wipe all drawings', category: 'control' },
];

const categoryColors = {
  navigation: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-800' },
  drawing: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-800' },
  tools: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-300', badge: 'bg-red-100 text-red-800' },
  control: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-300', badge: 'bg-green-100 text-green-800' },
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
  const filteredGestures = selectedCategory ? GESTURES.filter((g) => g.category === selectedCategory) : GESTURES;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Command className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Gesture Cheat Sheet</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600 mb-3">Filter by category:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === null ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                  selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {categoryNames[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGestures.map((item) => {
              const colors = categoryColors[item.category];
              return (
                <div key={`${item.gesture}`} className={`border-2 rounded-lg p-4 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{item.emoji}</span>
                    <div>
                      <p className="font-bold">{item.gesture}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${colors.badge}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold text-base mb-2">{item.action}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border-t px-6 py-4">
          <p className="text-sm text-gray-600 text-center">Press <kbd className="px-2 py-1 bg-gray-200 rounded">H</kbd> to toggle</p>
        </div>
      </div>
    </div>
  );
};

export default GestureCheatSheet;
