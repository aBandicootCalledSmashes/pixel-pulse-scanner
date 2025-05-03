
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Map, MessageSquare, Phone, Calendar, CreditCard } from "lucide-react";
import { QROptions, QRCodeType } from "@/lib/qr-generator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodeDisplayProps {
  dataUrl: string | null;
  options: QROptions;
  onDownload: (format: 'png' | 'svg') => void;
  type?: QRCodeType;
  parsedContent?: Record<string, string> | null;
}

export default function QRCodeDisplay({ dataUrl, options, onDownload, type, parsedContent }: QRCodeDisplayProps) {
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

  const renderContentPreview = () => {
    if (!type || !parsedContent) return null;
    
    switch (type) {
      case 'location':
        return (
          <Card className="w-full mt-4 bg-muted/30 border-none">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Map className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <Badge className="mb-1">Location</Badge>
                  {parsedContent.query ? (
                    <p className="text-sm">{parsedContent.query}</p>
                  ) : (
                    <p className="text-sm">
                      Lat: {parsedContent.latitude}, Lng: {parsedContent.longitude}
                    </p>
                  )}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary"
                    onClick={() => {
                      const url = parsedContent.query 
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parsedContent.query)}` 
                        : `https://www.google.com/maps/search/?api=1&query=${parsedContent.latitude},${parsedContent.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    Open in Google Maps →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'sms':
        return (
          <Card className="w-full mt-4 bg-muted/30 border-none">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <Badge className="mb-1">SMS</Badge>
                  <p className="text-sm font-medium">To: {parsedContent.phone}</p>
                  {parsedContent.message && (
                    <p className="text-xs text-muted-foreground">{parsedContent.message}</p>
                  )}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary"
                    onClick={() => {
                      // Check if it's mobile, then open SMS app
                      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        window.location.href = `sms:${parsedContent.phone}${parsedContent.message ? `?body=${encodeURIComponent(parsedContent.message)}` : ''}`;
                      }
                    }}
                  >
                    Send SMS →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'call':
        return (
          <Card className="w-full mt-4 bg-muted/30 border-none">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <Badge className="mb-1">Call</Badge>
                  <p className="text-sm font-medium">{parsedContent.phone}</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary"
                    onClick={() => {
                      // Check if it's mobile, then open phone app
                      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        window.location.href = `tel:${parsedContent.phone}`;
                      }
                    }}
                  >
                    Make Call →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'event':
        return (
          <Card className="w-full mt-4 bg-muted/30 border-none">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <Badge className="mb-1">Calendar Event</Badge>
                  <p className="text-sm font-medium">{parsedContent.title}</p>
                  {parsedContent.start && <p className="text-xs">From: {formatCalendarDate(parsedContent.start)}</p>}
                  {parsedContent.end && <p className="text-xs">To: {formatCalendarDate(parsedContent.end)}</p>}
                  {parsedContent.location && <p className="text-xs text-muted-foreground">{parsedContent.location}</p>}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary"
                    onClick={() => createCalendarEvent(parsedContent)}
                  >
                    Add to Calendar →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'payment':
        return (
          <Card className="w-full mt-4 bg-muted/30 border-none">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <CreditCard className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <Badge className="mb-1">Payment {parsedContent.type === 'paypal' ? 'PayPal' : 'Bitcoin'}</Badge>
                  <p className="text-sm font-medium">
                    To: {parsedContent.recipient?.substring(0, 20)}{parsedContent.recipient?.length > 20 ? '...' : ''}
                  </p>
                  {parsedContent.amount && <p className="text-xs">Amount: {parsedContent.amount}</p>}
                  {parsedContent.type === 'paypal' && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-xs text-primary"
                      onClick={() => {
                        window.open(`https://www.paypal.com/paypalme/${parsedContent.recipient}${parsedContent.amount ? `/${parsedContent.amount}` : ''}`, '_blank');
                      }}
                    >
                      Open in PayPal →
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };
  
  // Format calendar date for display
  const formatCalendarDate = (dateStr: string) => {
    try {
      if (dateStr.length === 8) { // YYYYMMDD
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      }
      if (dateStr.length === 15) { // YYYYMMDDThhmmss
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)} ${dateStr.substring(9, 11)}:${dateStr.substring(11, 13)}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };
  
  // Create calendar event helper
  const createCalendarEvent = (event: Record<string, string>) => {
    try {
      // Generate iCalendar file
      let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
      ics += `SUMMARY:${event.title}\n`;
      ics += `DTSTART:${event.start}\n`;
      ics += `DTEND:${event.end}\n`;
      if (event.location) ics += `LOCATION:${event.location}\n`;
      if (event.description) ics += `DESCRIPTION:${event.description}\n`;
      ics += 'END:VEVENT\nEND:VCALENDAR';
      
      // Create download link
      const blob = new Blob([ics], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title || 'event'}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error creating calendar event:', e);
    }
  };

  if (!dataUrl) {
    return (
      <div className="aspect-square w-full max-w-[300px] rounded-xl border border-dashed border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <p className="text-white/60 text-center px-8">QR code will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
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
      
      {type && <Badge>{type}</Badge>}
      
      {renderContentPreview()}
      
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
