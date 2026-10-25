import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

async function createTestPDF() {
  const pdfDoc = await PDFDocument.create();
  
  // Create 5 pages
  for (let i = 1; i <= 5; i++) {
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    page.drawText(`Slide ${i}`, {
      x: 50,
      y: height - 100,
      size: 48,
      color: rgb(0, 0, 0),
    });
    
    // Add subtitle
    const subtitles = [
      'Welcome to PDF Presentation Demo',
      'Camera & Hand Gesture Controls',
      'Auto-Play Features with Custom Timing',
      'Drawing Tools & Annotations',
      'Thank You!'
    ];
    
    page.drawText(subtitles[i - 1], {
      x: 50,
      y: height - 150,
      size: 18,
      color: rgb(0.25, 0.25, 0.25),
    });
    
    // Add content
    const contents = [
      'Click "Start Presentation" to enable camera',
      'Allow camera access when prompted',
      'Click Play button to auto-advance slides',
      'Draw, highlight, and annotate on any slide',
      'Gesture detection works with hand movements'
    ];
    
    page.drawText(contents[i - 1], {
      x: 50,
      y: height - 200,
      size: 14,
      color: rgb(0.4, 0.4, 0.4),
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('sample-presentation.pdf', pdfBytes);
  console.log('✅ PDF created: sample-presentation.pdf');
}

createTestPDF().catch(console.error);
