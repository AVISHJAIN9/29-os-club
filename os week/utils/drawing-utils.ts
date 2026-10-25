export interface DrawingTool {
  type: 'pen' | 'highlighter' | 'eraser';
  color: string;
  size: number;
  alpha: number;
}

export interface Shape {
  type: 'box' | 'circle' | 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
}

export interface DrawingState {
  isDrawing: boolean;
  tool: DrawingTool;
  history: ImageData[];
  historyIndex: number;
  shapes: Shape[];
}

export const DEFAULT_COLORS = ['#FF0000', '#0000FF', '#00AA00', '#000000'];

export const drawPen = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  tool: DrawingTool
) => {
  ctx.globalAlpha = 1;
  ctx.strokeStyle = tool.color;
  ctx.lineWidth = tool.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
};

export const drawHighlighter = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  size: number = 20
) => {
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#FFFF00';
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

export const drawEraser = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 30
) => {
  ctx.clearRect(x - size / 2, y - size / 2, size, size);
};

export const drawBox = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  size: number = 2
) => {
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.strokeRect(
    Math.min(startX, endX),
    Math.min(startY, endY),
    Math.abs(endX - startX),
    Math.abs(endY - startY)
  );
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  size: number = 2
) => {
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  ctx.beginPath();
  ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  size: number = 2
) => {
  const headlen = 15;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size;

  // Draw line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
};

export const drawLaserPointer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) => {
  // Outer glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - 30, y - 30, 60, 60);

  // Inner bright dot
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
};

export const clearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const saveCanvasState = (canvas: HTMLCanvasElement, history: ImageData[], historyIndex: number) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { history, historyIndex };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(imageData);

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

export const undo = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  history: ImageData[],
  historyIndex: number
) => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    return { history, historyIndex: newIndex };
  }
  return { history, historyIndex };
};

export const redo = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  history: ImageData[],
  historyIndex: number
) => {
  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    return { history, historyIndex: newIndex };
  }
  return { history, historyIndex };
};

// Feature 20: Screenshot/Snap Slide to Image
export const captureSlideAsImage = async (
  slideContainer: HTMLElement,
  slideNumber: number = 1
): Promise<Blob> => {
  // Using html2canvas approach - requires library in production
  // For now, using canvas API
  const canvas = document.createElement('canvas');
  canvas.width = slideContainer.offsetWidth;
  canvas.height = slideContainer.offsetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Draw background
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Get text content from slide
  const text = slideContainer.innerText || `Slide ${slideNumber}`;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
};

export const downloadSlideImage = async (
  slideContainer: HTMLElement,
  slideNumber: number = 1
) => {
  try {
    const blob = await captureSlideAsImage(slideContainer, slideNumber);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `slide-${slideNumber}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download slide image:', error);
  }
};
