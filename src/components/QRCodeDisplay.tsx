
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { QROptions } from "@/lib/qr-generator";

interface QRCodeDisplayProps {
  dataUrl: string | null;
  options: QROptions;
  onDownload: (format: 'png' | 'svg') => void;
}

export default function QRCodeDisplay({ dataUrl, options, onDownload }: QRCodeDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevDataUrlRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (dataUrl && dataUrl !== prevDataUrlRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      prevDataUrlRef.current = dataUrl;
      return () => clearTimeout(timer);
    }
  }, [dataUrl]);

  if (!dataUrl) {
    return (
      <div className="aspect-square w-full max-w-[300px] rounded-xl border border-dashed border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <p className="text-white/60 text-center px-8">QR code will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative transition-all duration-300 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
        <div className="bg-gradient-to-r from-purple-500/20 to-purple-700/20 p-[1px] rounded-xl shadow-lg">
          <div className="backdrop-blur-md rounded-xl overflow-hidden">
            <img
              src={dataUrl}
              alt="Generated QR Code"
              className="w-full max-w-[300px] aspect-square object-contain bg-white"
              style={{
                maxWidth: options.size ? `${options.size}px` : '300px',
              }}
            />
          </div>
        </div>
        <div className="absolute inset-0 rounded-xl bg-purple-500/10 blur-xl -z-10"></div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 text-xs"
          onClick={() => onDownload('png')}
        >
          <Download className="h-3.5 w-3.5" />
          PNG
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 text-xs"
          onClick={() => onDownload('svg')}
        >
          <Download className="h-3.5 w-3.5" />
          SVG
        </Button>
      </div>
    </div>
  );
}
