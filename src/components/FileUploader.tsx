import React, { useState, useRef, useCallback } from "react";
import { Upload, FileWarning, FileCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploaderProps {
  onFileUpload?: (file: File) => void;
  isProcessing?: boolean;
  error?: string | null;
}

const FileUploader = ({
  onFileUpload = () => {},
  isProcessing = false,
  error = null,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    // Check if file is PDF
    if (file.type !== "application/pdf") {
      return false;
    }
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return false;
    }
    return true;
  };

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
          onFileUpload(file);
        } else {
          // Handle invalid file
          setSelectedFile(null);
        }
      }
    },
    [onFileUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
          onFileUpload(file);
        } else {
          // Handle invalid file
          setSelectedFile(null);
        }
      }
    },
    [onFileUpload],
  );

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white">
      <div
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50"
        } ${isProcessing ? "opacity-75 pointer-events-none" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileSelect}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-medium text-gray-900">
              Processing your file...
            </h3>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center justify-center py-8">
            <FileCheck className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">File selected</h3>
            <p className="text-sm text-gray-500 mt-2">{selectedFile.name}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleBrowseClick}
            >
              Choose a different file
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Upload className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">
              Drag & Drop your bank statement
            </h3>
            <p className="text-sm text-gray-500 mt-2">or</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleBrowseClick}
            >
              Browse files
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Supported format: PDF (Max size: 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <FileWarning className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default FileUploader;
