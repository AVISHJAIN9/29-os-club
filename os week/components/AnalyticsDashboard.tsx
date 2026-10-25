import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Zap, Clock } from 'lucide-react';

export interface GestureAnalytics {
  gestureName: string;
  count: number;
  confidence: number;
  emoji: string;
}

export interface AnalyticsData {
  totalGestures: number;
  presentationDuration: number;
  slideCount: number;
  gestures: GestureAnalytics[];
  annotationCount: number;
  accuracyRate: number;
  gesturesByType: Record<string, number>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  const metrics = useMemo(() => {
    const avgGesturesPerSlide = (data.totalGestures / data.slideCount).toFixed(2);
    const gesturesPerMinute = (data.totalGestures / (data.presentationDuration / 60)).toFixed(1);
    const topGesture = data.gestures.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );

    return {
      avgGesturesPerSlide,
      gesturesPerMinute,
      topGesture,
      accuracyPercent: Math.round(data.accuracyRate * 100),
    };
  }, [data]);

  const sortedGestures = [...data.gestures].sort((a, b) => b.count - a.count);
  const maxCount = sortedGestures[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gestures</p>
              <p className="text-3xl font-bold text-blue-600">{data.totalGestures}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-3xl font-bold text-green-600">{metrics.accuracyPercent}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-3xl font-bold text-purple-600">{Math.floor(data.presentationDuration / 60)}m</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Annotations</p>
              <p className="text-3xl font-bold text-orange-600">{data.annotationCount}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Gestures/Slide</p>
          <p className="text-2xl font-bold">{metrics.avgGesturesPerSlide}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Gestures/Minute</p>
          <p className="text-2xl font-bold">{metrics.gesturesPerMinute}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Most Used</p>
          <p className="text-2xl font-bold">{metrics.topGesture.emoji} {metrics.topGesture.gestureName}</p>
        </div>
      </div>

      {/* Gesture Breakdown */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Gesture Usage</h3>
        <div className="space-y-3">
          {sortedGestures.slice(0, 5).map((gesture) => {
            const percentage = (gesture.count / maxCount) * 100;
            return (
              <div key={gesture.gestureName}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{gesture.emoji}</span>
                    <span className="font-medium">{gesture.gestureName}</span>
                  </div>
                  <span className="text-sm font-bold">{gesture.count}×</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
