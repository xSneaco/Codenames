import React, { useState, useRef, useCallback } from 'react';
import { uploadWordlist } from '../utils/api';

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

    // Read file to validate word count
    const text = await file.text();
    const words = text
      .split(/[\n,]/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length < 25) {
      setError(`Wordlist must contain at least 25 words. Found: ${words.length}`);
      return;
    }

    // Upload file
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await uploadWordlist(lobbyId, file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(`Uploaded ${words.length} words successfully!`);
      onUploadSuccess?.();
    } catch (err) {
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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [lobbyId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Custom Wordlist (Optional)
      </label>

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800'
        } ${isUploading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <svg
              className="w-10 h-10 mx-auto text-purple-500 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-gray-400">Uploading...</div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg
              className={`w-10 h-10 mx-auto mb-3 ${
                isDragging ? 'text-purple-500' : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-400 text-sm">
              <span className="text-purple-400 font-medium">Click to upload</span> or
              drag and drop
            </p>
            <p className="text-gray-500 text-xs mt-1">
              .txt or .csv (minimum 25 words)
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Default wordlist info */}
      <p className="text-gray-500 text-xs">
        If no wordlist is uploaded, the default English wordlist will be used.
      </p>
    </div>
  );
};

export default WordlistUpload;
