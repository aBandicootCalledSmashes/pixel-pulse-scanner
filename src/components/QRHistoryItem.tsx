
import { QRHistoryItem as QRHistoryItemType } from "@/lib/qr-generator";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QRHistoryItemProps {
  item: QRHistoryItemType;
  onSelect: (item: QRHistoryItemType) => void;
  onDelete: (id: string) => void;
  onDownload: (dataUrl: string, format: 'png' | 'svg') => void;
}

export default function QRHistoryItem({ item, onSelect, onDelete, onDownload }: QRHistoryItemProps) {
  const getTypeIcon = () => {
    switch(item.type) {
      case "url":
        return <span className="text-blue-400">URL</span>;
      case "email":
        return <span className="text-green-400">Email</span>;
      case "wifi":
        return <span className="text-yellow-400">WiFi</span>;
      case "vcard":
        return <span className="text-pink-400">vCard</span>;
      case "text":
        return <span className="text-purple-400">Text</span>;
    }
  };
  
  const getContentPreview = () => {
    const maxLength = 30;
    if (item.content.length > maxLength) {
      return item.content.substring(0, maxLength) + "...";
    }
    return item.content;
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div 
        className="w-16 h-16 flex-shrink-0 border border-white/20 rounded-md overflow-hidden cursor-pointer"
        onClick={() => onSelect(item)}
      >
        <img 
          src={item.dataUrl} 
          alt="QR Code" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0" onClick={() => onSelect(item)}>
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-white/80 truncate mt-1">{getContentPreview()}</p>
      </div>
      
      <div className="flex flex-col gap-1 self-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={() => onDownload(item.dataUrl, 'png')}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only">Download</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
