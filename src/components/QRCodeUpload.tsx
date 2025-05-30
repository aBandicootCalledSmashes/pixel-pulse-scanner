
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface QRCodeUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export default function QRCodeUpload({ onUpload }: QRCodeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      await onUpload(file);
    } catch (error) {
      console.error("Error uploading QR code:", error);
    } finally {
      setIsUploading(false);
      // Clear the input value to allow uploading the same file again
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }

    const file = e.dataTransfer.files[0];
    setIsUploading(true);

    try {
      await onUpload(file);
    } catch (error) {
      console.error("Error uploading QR code:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center p-4 border border-dashed ${
        isDragging ? "border-primary" : "border-white/20"
      } rounded-lg bg-background/30 transition-colors cursor-pointer`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center w-full cursor-pointer">
        <div className="flex items-center justify-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Upload QR Code</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or SVG up to 5MB</p>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/svg+xml"
          onChange={handleUpload}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="mt-2 text-xs text-muted-foreground animate-pulse">
            Processing...
          </div>
        )}
      </label>
    </div>
  );
}
