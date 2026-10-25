import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth';
import { AlertCircle } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.register(email, username, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="glass-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                autoComplete="email"
                className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {isLogin && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <p className="font-semibold mb-1">Demo Login:</p>
              <p>Email: user@test.com</p>
              <p>Password: test123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
