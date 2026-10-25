import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Zap, Clock } from 'lucide-react';

export interface GestureAnalytics {
  gestureName: string;
  count: number;
  confidence: number; // average confidence
  emoji: string;
}

export interface AnalyticsData {
  totalGestures: number;
  presentationDuration: number; // seconds
  slideCount: number;
  gestures: GestureAnalytics[];
  annotationCount: number;
  accuracyRate: number; // 0-1
  gesturesByType: Record<string, number>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  // Calculate derived metrics
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

  // Sort gestures by count
  const sortedGestures = [...data.gestures].sort((a, b) => b.count - a.count);
  const maxCount = sortedGestures[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gestures */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 
                       rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Gestures</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.totalGestures}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 
                       rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.accuracyPercent}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Duration */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 
                       rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Math.floor(data.presentationDuration / 60)}m
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        {/* Annotations */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 
                       rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Annotations</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{data.annotationCount}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Gestures/Slide</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.avgGesturesPerSlide}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gestures/Minute</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.gesturesPerMinute}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Used Gesture</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.topGesture.emoji} {metrics.topGesture.gestureName}
          </p>
        </div>
      </div>

      {/* Gesture Breakdown */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gesture Usage Breakdown</h3>
        <div className="space-y-3">
          {sortedGestures.map((gesture) => {
            const percentage = (gesture.count / maxCount) * 100;
            const barColor = gesture.confidence > 0.75 ? 'bg-green-500' : gesture.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500';

            return (
              <div key={gesture.gestureName}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{gesture.emoji}</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {gesture.gestureName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{gesture.count}×</span>
                    <span className="text-gray-600 dark:text-gray-400">{Math.round(gesture.confidence * 100)}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${barColor} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.gesturesByType).map(([category, count]) => {
            const percentage = ((count / data.totalGestures) * 100).toFixed(1);
            const categoryColors = {
              navigation: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300',
              drawing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300',
              tools: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300',
              control: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300',
            };

            const color = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300';

            return (
              <div key={category} className={`border rounded-lg p-4 ${color}`}>
                <p className="text-sm font-medium capitalize mb-1">{category}</p>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs mt-1 opacity-75">{percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
