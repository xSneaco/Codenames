'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardBody, Progress } from '@heroui/react';
import { Upload, Check, X } from 'lucide-react';
import { uploadWordlist } from '@/utils/api';
import { colors } from '@/styles/colors';

interface WordlistUploadProps {
  lobbyId: string;
  onUploadSuccess?: () => void;
}

const WordlistUpload: React.FC<WordlistUploadProps> = ({
  lobbyId,
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const validTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel'];
    const validExtensions = ['.txt', '.csv'];

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      return 'Please upload a .txt or .csv file';
    }

    if (file.size > 1024 * 1024) {
      return 'File size must be less than 1MB';
    }

    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const text = await file.text();
    const words = text
      .split(/[\n,]/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length < 25) {
      setError(`Wordlist must contain at least 25 words. Found: ${words.length}`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      await uploadWordlist(lobbyId, file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(`Successfully uploaded ${words.length} words!`);
      onUploadSuccess?.();
    } catch (err) {
      clearInterval(progressInterval);
      setError('Failed to upload wordlist. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [lobbyId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      <Card
        className={`bg-black/20 border-dashed border-2 transition-all duration-300 ${
          isDragging 
            ? 'border-accent-main bg-accent-main/10 scale-[1.02]' 
            : 'border-white/10 hover:border-white/20 hover:bg-black/30'
        }`}
      >
        <CardBody className="p-0 overflow-hidden">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center p-6 cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
          >
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt,.csv"
              className="hidden"
            />

            {!isUploading && (
              <>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging ? 'bg-accent-main text-white' : 'bg-white/5 text-text-secondary'}`}>
                  <Upload size={20} />
                </div>

                <div className="text-center">
                  <p className="font-bold text-white text-sm uppercase tracking-wide">
                    Custom Wordlist
                  </p>
                  <p className="text-xs text-text-secondary mt-1 max-w-[200px] mx-auto">
                    Drag & drop .txt or .csv
                  </p>
                </div>
              </>
            )}

            {isUploading && (
              <div className="w-full flex flex-col items-center gap-2">
                 <Progress
                    size="sm"
                    value={uploadProgress}
                    color="secondary"
                    classNames={{ indicator: "bg-accent-main" }}
                />
                <p className="text-[10px] text-center mt-2 text-text-secondary uppercase tracking-widest">
                    Uploading...
                </p>
              </div>
            )}
          </div>

            {error && (
              <div className="bg-red-500/10 border-t border-red-500/20 p-2 flex items-center justify-center gap-2">
                 <X size={14} className="text-red-500" />
                 <p className="text-xs text-red-400 font-medium">{error}</p>
              </div>
            )}

            {success && (
               <div className="bg-green-500/10 border-t border-green-500/20 p-2 flex items-center justify-center gap-2">
                 <Check size={14} className="text-main-success" />
                 <p className="text-xs text-main-success font-medium">{success}</p>
               </div>
            )}
        </CardBody>
      </Card>

      <div className="mt-2 text-center">
         <button className="text-[10px] text-text-secondary hover:text-white underline opacity-50 hover:opacity-100 transition-opacity">
            Download template
         </button>
      </div>
    </div>
  );
};

export default WordlistUpload;
