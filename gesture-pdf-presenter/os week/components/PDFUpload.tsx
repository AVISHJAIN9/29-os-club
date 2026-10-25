import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, AlertCircle } from 'lucide-react';

interface PDFUploadProps {
  onFileSelected: (file: File) => void;
  onError?: (error: string) => void;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onFileSelected, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      onError?.('Invalid file type. Only PDF files are allowed.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File is too large (max 50MB)');
      onError?.('File size exceeds 50MB limit');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (file: File) => {
    if (validateFile(file)) {
      onFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="w-5 h-5 text-blue-500" />
          Upload PDF Presentation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Drop your PDF here or click to select
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Maximum file size: 50MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
            onClick={(e) => {
              (e.target as HTMLInputElement).value = '';
            }}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose PDF File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
