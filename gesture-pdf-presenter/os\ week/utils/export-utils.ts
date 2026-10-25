import { PDFDocument, PDFImage, PageSizes } from 'pdf-lib';

/**
 * Export annotated PDF with canvas drawings embedded
 * @param originalPdfBytes - Original PDF file as ArrayBuffer
 * @param drawings - Map of page number to canvas ImageData
 * @param fileName - Output file name
 */
export async function exportAnnotatedPDF(
  originalPdfBytes: ArrayBuffer,
  drawings: Map<number, ImageData>,
  fileName: string = 'annotated-presentation.pdf'
) {
  try {
    // Load existing PDF
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const pages = pdfDoc.getPages();

    // For each page with drawings, embed the canvas as an image overlay
    for (let i = 0; i < pages.length; i++) {
      if (drawings.has(i)) {
        const imageData = drawings.get(i)!;
        const page = pages[i];

        // Convert ImageData to PNG
        const canvas = new OffscreenCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(imageData, 0, 0);
        const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
        const pngBytes = await pngBlob.arrayBuffer();

        // Embed image in PDF
        const pngImage = await pdfDoc.embedPng(pngBytes);
        const { width, height } = page.getSize();

        // Draw image at full page size
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }
    }

    // Save and download
    const pdfBytes = await pdfDoc.save();
    downloadFile(pdfBytes, fileName, 'application/pdf');
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Export presentation as ZIP with individual slide images
 * @param drawings - Map of page number to canvas ImageData
 * @param fileName - Output file name for zip
 */
export async function exportSlidesAsImages(
  drawings: Map<number, ImageData>,
  fileName: string = 'slides.zip'
) {
  try {
    // Note: This would require JSZip library to create zip files
    // For now, we'll export slides individually
    for (const [pageNum, imageData] of drawings.entries()) {
      const timestamp = new Date().getTime();
      downloadImageData(imageData, `slide-${pageNum + 1}-${timestamp}.png`);
    }
    return true;
  } catch (error) {
    console.error('Error exporting slides:', error);
    throw error;
  }
}

/**
 * Convert canvas to image and download
 */
export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  fileName: string = 'slide.png'
) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  link.click();
}

/**
 * Download ImageData as PNG
 */
export function downloadImageData(
  imageData: ImageData,
  fileName: string = 'drawing.png'
) {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * Generic file download helper
 */
export function downloadFile(
  data: ArrayBuffer | Blob | string,
  fileName: string,
  mimeType: string = 'application/octet-stream'
) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export presentation session as JSON for backup/sharing
 */
export function exportSessionAsJSON(
  sessionData: {
    title: string;
    slides: number;
    timestamp: string;
    metadata?: Record<string, any>;
  },
  fileName: string = 'session.json'
) {
  const json = JSON.stringify(sessionData, null, 2);
  downloadFile(json, fileName, 'application/json');
}

/**
 * Export presentation stats as CSV
 */
export function exportStatsAsCSV(
  stats: Array<{
    slide: number;
    gestures: number;
    drawingTime: number;
    timestamp: string;
  }>,
  fileName: string = 'stats.csv'
) {
  const headers = ['Slide', 'Gestures', 'Drawing Time (s)', 'Timestamp'];
  const rows = stats.map((s) => [s.slide, s.gestures, s.drawingTime, s.timestamp]);

  let csv = headers.join(',') + '\n';
  rows.forEach((row) => {
    csv += row.join(',') + '\n';
  });

  downloadFile(csv, fileName, 'text/csv');
}
