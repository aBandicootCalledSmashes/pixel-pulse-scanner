
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QRHistoryItem as QRHistoryItemType, getHistory, clearHistory } from "@/lib/qr-generator";
import QRHistoryItem from "./QRHistoryItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QRHistoryProps {
  onSelectHistoryItem: (item: QRHistoryItemType) => void;
  onDeleteHistoryItem: (id: string) => void;
  onDownloadHistoryItem: (dataUrl: string, format: 'png' | 'svg') => void;
}

export default function QRHistory({ 
  onSelectHistoryItem, 
  onDeleteHistoryItem,
  onDownloadHistoryItem 
}: QRHistoryProps) {
  const [history, setHistory] = useState<QRHistoryItemType[]>([]);
  
  useEffect(() => {
    setHistory(getHistory());
  }, []);
  
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };
  
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent QR Codes</h3>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearHistory}
            className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          <p>Your generated QR codes will appear here</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-2">
            {history.map((item) => (
              <QRHistoryItem
                key={item.id}
                item={item}
                onSelect={onSelectHistoryItem}
                onDelete={onDeleteHistoryItem}
                onDownload={onDownloadHistoryItem}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
