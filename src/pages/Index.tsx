
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QRCodeType, 
  QROptions, 
  QRHistoryItem as QRHistoryItemType, 
  generateQRCode, 
  downloadQRCode, 
  saveToHistory, 
  getHistory,
  decodeQRCode,
  detectQRCodeType,
  parseQRContent
} from "@/lib/qr-generator";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import QRCodeSettings from "@/components/QRCodeSettings";
import QRHistory from "@/components/QRHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export default function Index() {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState("");
  const [currentType, setCurrentType] = useState<QRCodeType>("url");
  const [currentOptions, setCurrentOptions] = useState<QROptions>({
    size: 300,
    foreground: "#8b5cf6",
    background: "#ffffff",
    margin: 1,
  });
  const [parsedContent, setParsedContent] = useState<Record<string, string> | null>(null);
  
  const handleGenerateQRCode = useCallback(async (content: string, type: QRCodeType, options: QROptions) => {
    if (!content.trim()) {
      toast({
        title: "Input required",
        description: "Please enter content to generate a QR code",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const dataUrl = await generateQRCode(content, options);
      setQrDataUrl(dataUrl);
      setCurrentContent(content);
      setCurrentType(type);
      setCurrentOptions(options);
      
      // Save to history
      const historyItem: QRHistoryItemType = {
        id: uuidv4(),
        type,
        content,
        options,
        dataUrl,
        timestamp: Date.now(),
      };
      
      saveToHistory(historyItem);
      
      toast({
        title: "QR code generated",
        description: "Your QR code has been successfully created",
      });
    } catch (error) {
      toast({
        title: "Error generating QR code",
        description: "Please try again with different content",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  const handleUploadQRCode = useCallback(async (file: File) => {
    try {
      const content = await decodeQRCode(file);
      const { type, content: detectedContent } = detectQRCodeType(content);
      
      // Parse the content based on the detected type
      const parsedData = parseQRContent(detectedContent, type);
      setParsedContent(parsedData);
      
      // Generate a new QR code from the decoded content
      const dataUrl = await generateQRCode(detectedContent, currentOptions);
      
      setQrDataUrl(dataUrl);
      setCurrentContent(detectedContent);
      setCurrentType(type);
      
      // Save to history
      const historyItem: QRHistoryItemType = {
        id: uuidv4(),
        type,
        content: detectedContent,
        options: currentOptions,
        dataUrl,
        timestamp: Date.now(),
      };
      
      saveToHistory(historyItem);
      
      toast({
        title: `QR code detected: ${type.toUpperCase()}`,
        description: "Your QR code has been successfully scanned and analyzed",
      });
    } catch (error) {
      console.error("Error uploading QR code:", error);
      toast({
        title: "Error uploading QR code",
        description: "Could not read the QR code from the uploaded image",
        variant: "destructive",
      });
    }
  }, [currentOptions, toast]);
  
  const handleDownload = useCallback((format: 'png' | 'svg') => {
    if (!qrDataUrl) return;
    
    downloadQRCode(qrDataUrl, format);
    toast({
      title: `QR code downloaded as ${format.toUpperCase()}`,
    });
  }, [qrDataUrl, toast]);
  
  const handleSelectHistoryItem = useCallback((item: QRHistoryItemType) => {
    setQrDataUrl(item.dataUrl);
    setCurrentContent(item.content);
    setCurrentType(item.type);
    setCurrentOptions(item.options);
    
    // Parse the content for display
    const parsedData = parseQRContent(item.content, item.type);
    setParsedContent(parsedData);
  }, []);
  
  const handleDeleteHistoryItem = useCallback((id: string) => {
    const history = getHistory();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem('qr-pulse-history', JSON.stringify(newHistory));
    
    toast({
      title: "QR code removed from history",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-futuristic-grid bg-grid-pattern -z-10 opacity-20"></div>
      <div className="fixed inset-0 bg-gradient-radial from-purple-900/30 to-background -z-10"></div>
      
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center">
            <span className="text-white font-bold">QR</span>
          </div>
          <h1 className="text-xl font-bold text-gradient">PixelPulse</h1>
        </div>
        <ThemeToggle />
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container py-8 px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: QR Settings */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Generate QR Code</h2>
              <QRCodeSettings 
                onGenerate={handleGenerateQRCode} 
                onUpload={handleUploadQRCode}
                selectedType={currentType}
                parsedContent={parsedContent}
              />
            </div>
            
            {/* QR Code Display (Mobile) */}
            <div className="block lg:hidden glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Your QR Code</h2>
              <div className="flex justify-center">
                <QRCodeDisplay 
                  dataUrl={qrDataUrl} 
                  options={currentOptions}
                  onDownload={handleDownload}
                  type={currentType}
                  parsedContent={parsedContent}
                />
              </div>
            </div>
          </div>
          
          {/* Right Column: QR Display & History */}
          <div className="space-y-8">
            {/* QR Code Display (Desktop) */}
            <div className="hidden lg:block glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Your QR Code</h2>
              <div className="flex justify-center">
                <QRCodeDisplay 
                  dataUrl={qrDataUrl} 
                  options={currentOptions}
                  onDownload={handleDownload}
                  type={currentType}
                  parsedContent={parsedContent}
                />
              </div>
            </div>
            
            {/* History */}
            <div className="glass-card rounded-xl p-6 h-[400px]">
              <QRHistory 
                onSelectHistoryItem={handleSelectHistoryItem}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onDownloadHistoryItem={(dataUrl, format) => {
                  downloadQRCode(dataUrl, format);
                  toast({
                    title: `QR code downloaded as ${format.toUpperCase()}`,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-4 px-4 sm:px-6 border-t border-white/10 text-sm text-center text-muted-foreground">
        <p>PixelPulse QR Generator &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
