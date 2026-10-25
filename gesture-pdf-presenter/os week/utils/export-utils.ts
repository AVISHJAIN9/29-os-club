export function downloadFile(data: ArrayBuffer | Blob | string, fileName: string, mimeType: string = 'application/octet-stream') {
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

export async function exportAnnotatedPDF(
  originalPdfBytes: ArrayBuffer,
  drawings: Map<number, ImageData>,
  fileName: string = 'annotated-presentation.pdf'
) {
  try {
    const pdfBlob = new Blob([originalPdfBytes], { type: 'application/pdf' });
    downloadFile(pdfBlob, fileName, 'application/pdf');
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

export function exportSessionAsJSON(
  sessionData: { title: string; slides: number; timestamp: string; metadata?: Record<string, any> },
  fileName: string = 'session.json'
) {
  const json = JSON.stringify(sessionData, null, 2);
  downloadFile(json, fileName, 'application/json');
}

export function exportStatsAsCSV(
  stats: Array<{ slide: number; gestures: number; timestamp: string }>,
  fileName: string = 'stats.csv'
) {
  const headers = ['Slide', 'Gestures', 'Timestamp'];
  const rows = stats.map((s) => [s.slide, s.gestures, s.timestamp]);

  let csv = headers.join(',') + '\n';
  rows.forEach((row) => {
    csv += row.join(',') + '\n';
  });

  downloadFile(csv, fileName, 'text/csv');
}
