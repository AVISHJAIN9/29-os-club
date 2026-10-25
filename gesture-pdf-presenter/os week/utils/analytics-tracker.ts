export interface GestureRecord {
  gesture: string;
  emoji: string;
  timestamp: number;
  confidence: number;
  position: { x: number; y: number };
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

    const count = this.stats.gesturesByName.get(gesture) || 0;
    this.stats.gesturesByName.set(gesture, count + 1);

    this.stats.averageConfidence =
      (this.stats.averageConfidence * (this.stats.totalGestures - 1) + confidence) / this.stats.totalGestures;
  }

  recordAnnotation(type: string, slideNumber: number) {
    this.stats.totalAnnotations++;
  }

  endSession() {
    this.stats.endTime = Date.now();
  }

  getDuration(): number {
    const endTime = this.stats.endTime || Date.now();
    return (endTime - this.stats.startTime) / 1000;
  }

  getStats(): SessionStats {
    return { ...this.stats };
  }
}
