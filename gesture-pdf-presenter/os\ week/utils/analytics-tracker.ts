/**
 * Analytics tracker for gesture presentations
 */

export interface GestureRecord {
  gesture: string;
  emoji: string;
  timestamp: number;
  confidence: number;
  position: { x: number; y: number };
}

export interface AnnotationRecord {
  type: 'draw' | 'highlight' | 'shape' | 'erase';
  timestamp: number;
  slideNumber: number;
}

export interface SessionStats {
  totalGestures: number;
  totalAnnotations: number;
  startTime: number;
  endTime?: number;
  slideCount: number;
  gesturesByName: Map<string, number>;
  averageConfidence: number;
  gestureRecords: GestureRecord[];
  annotationRecords: AnnotationRecord[];
}

export class AnalyticsTracker {
  private stats: SessionStats;

  constructor(slideCount: number) {
    this.stats = {
      totalGestures: 0,
      totalAnnotations: 0,
      startTime: Date.now(),
      slideCount,
      gesturesByName: new Map(),
      averageConfidence: 0,
      gestureRecords: [],
      annotationRecords: [],
    };
  }

  recordGesture(gesture: string, emoji: string, confidence: number, position: { x: number; y: number }) {
    this.stats.totalGestures++;

    const record: GestureRecord = {
      gesture,
      emoji,
      timestamp: Date.now(),
      confidence,
      position,
    };

    this.stats.gestureRecords.push(record);

    // Update gesture count
    const count = this.stats.gesturesByName.get(gesture) || 0;
    this.stats.gesturesByName.set(gesture, count + 1);

    // Update average confidence
    this.stats.averageConfidence =
      (this.stats.averageConfidence * (this.stats.totalGestures - 1) + confidence) / this.stats.totalGestures;
  }

  recordAnnotation(type: 'draw' | 'highlight' | 'shape' | 'erase', slideNumber: number) {
    this.stats.totalAnnotations++;
    this.stats.annotationRecords.push({
      type,
      timestamp: Date.now(),
      slideNumber,
    });
  }

  endSession() {
    this.stats.endTime = Date.now();
  }

  getDuration(): number {
    const endTime = this.stats.endTime || Date.now();
    return (endTime - this.stats.startTime) / 1000; // seconds
  }

  getStats(): SessionStats {
    return { ...this.stats };
  }

  getGestureStats() {
    const gesturesArray = Array.from(this.stats.gesturesByName.entries()).map(([gesture, count]) => ({
      gesture,
      count,
      percentage: (count / this.stats.totalGestures) * 100,
    }));

    return gesturesArray.sort((a, b) => b.count - a.count);
  }

  reset() {
    this.stats = {
      totalGestures: 0,
      totalAnnotations: 0,
      startTime: Date.now(),
      slideCount: this.stats.slideCount,
      gesturesByName: new Map(),
      averageConfidence: 0,
      gestureRecords: [],
      annotationRecords: [],
    };
  }
}
