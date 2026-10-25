import React, { useState, useEffect } from 'react';
import { GestureControl } from './GestureControl';
import { Auth } from './components/Auth';
import { authService } from './services/auth';
import { Button } from './components/ui/button';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [currentUser, setCurrentUser] = useState(authService.getUser());

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
      setCurrentUser(authService.getUser());
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => {
      setIsAuthenticated(true);
      setCurrentUser(authService.getUser());
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎬 PDF Presentation Controller
            </h1>
            <p className="text-gray-400">
              Welcome, {currentUser?.username}! Control slides and annotate with hand gestures.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            Logout
          </Button>
        </header>

        {/* Main Component */}
        <GestureControl
          isEnabled={true}
          onPlay={() => {
            console.log('Play');
            setIsVideoPlaying(true);
          }}
          onPause={() => {
            console.log('Paused');
            setIsVideoPlaying(false);
          }}
          onSkipForward={() => {
            console.log('Next slide');
          }}
          onSkipBack={() => {
            console.log('Previous slide');
          }}
          onRewind10={() => {
            console.log('Rewind 10s');
          }}
          onForward10={() => {
            console.log('Forward 10s');
          }}
          onPermissionError={() => {
            console.log('Camera permission denied');
          }}
        />

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm border-t border-gray-700 pt-8">
          <p className="mb-4">✨ All 20 Features Available ✨</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>✌️ Draw Mode</div>
            <div>👍 Laser Pointer</div>
            <div>🖐️ Resume</div>
            <div>✊ Blank Screen</div>
            <div>🤏 Zoom</div>
            <div>🤟 Erase</div>
            <div>📹 Webcam</div>
            <div>⏱️ Timer</div>
            <div>🌙 Dark Mode</div>
            <div>📷 Screenshot</div>
            <div>📋 Thumbnails</div>
            <div>💾 Save Session</div>
          </div>
          <p className="mt-6 text-xs text-gray-600">
            © 2026 Gesture PDF Annotator • Built with React, Vite & Express
          </p>
        </footer>
      </div>
    </div>
  );
}
