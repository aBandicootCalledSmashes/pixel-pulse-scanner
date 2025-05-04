import QRCode from 'qrcode';
import jsQR from 'jsqr';

export type QRCodeType = 'text' | 'url' | 'email' | 'wifi' | 'vcard' | 'location' | 'sms' | 'call' | 'event' | 'payment';

export interface QROptions {
  size?: number;
  foreground?: string;
  background?: string;
  margin?: number;
  logoUrl?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRHistoryItem {
  id: string;
  type: QRCodeType;
  content: string;
  options: QROptions;
  dataUrl: string;
  timestamp: number;
}

export const generateQRCode = async (content: string, options: QROptions = {}): Promise<string> => {
  const {
    size = 300,
    foreground = '#000000',
    background = '#ffffff',
    margin = 1,
    errorCorrectionLevel = 'M',
  } = options;

  try {
    return await QRCode.toDataURL(content, {
      width: size,
      margin,
      color: {
        dark: foreground,
        light: background,
      },
      errorCorrectionLevel,
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
};

export const formatWifiContent = (ssid: string, password: string, security = 'WPA') => {
  return `WIFI:S:${ssid};T:${security};P:${password};;`;
};

export const formatEmailContent = (email: string, subject = '', body = '') => {
  let content = `mailto:${email}`;
  if (subject || body) {
    content += '?';
    if (subject) content += `subject=${encodeURIComponent(subject)}`;
    if (subject && body) content += '&';
    if (body) content += `body=${encodeURIComponent(body)}`;
  }
  return content;
};

export const formatVCardContent = (
  name: string,
  phone = '',
  email = '',
  organization = '',
  title = '',
  url = '',
  address = ''
) => {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  vcard += `N:${name};;;\n`;
  vcard += `FN:${name}\n`;
  if (phone) vcard += `TEL:${phone}\n`;
  if (email) vcard += `EMAIL:${email}\n`;
  if (organization) vcard += `ORG:${organization}\n`;
  if (title) vcard += `TITLE:${title}\n`;
  if (url) vcard += `URL:${url}\n`;
  if (address) vcard += `ADR:;;${address};;;\n`;
  vcard += 'END:VCARD';
  return vcard;
};

// Updated formatLocationContent to use address
export const formatLocationContent = (address: string) => {
  return `geo:0,0?q=${encodeURIComponent(address)}`;
};

export const formatSmsContent = (phone: string, message = '') => {
  return `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
};

export const formatCallContent = (phone: string) => {
  return `tel:${phone}`;
};

export const formatEventContent = (
  title: string,
  startDate: string,
  endDate: string,
  location = '',
  description = ''
) => {
  let event = 'BEGIN:VEVENT\n';
  event += `SUMMARY:${title}\n`;
  event += `DTSTART:${startDate}\n`;
  event += `DTEND:${endDate}\n`;
  if (location) event += `LOCATION:${location}\n`;
  if (description) event += `DESCRIPTION:${description}\n`;
  event += 'END:VEVENT';
  return event;
};

export const formatPaymentContent = (type: 'paypal' | 'bitcoin', recipient: string, amount = '', currency = 'USD', note = '') => {
  if (type === 'paypal') {
    let url = `https://www.paypal.com/paypalme/${recipient}`;
    if (amount) url += `/${amount}`;
    return url;
  } else if (type === 'bitcoin') {
    return `bitcoin:${recipient}${amount ? `?amount=${amount}` : ''}${note ? `&message=${encodeURIComponent(note)}` : ''}`;
  }
  return '';
};

// QR Code Type Detection Functions
export const detectQRCodeType = (content: string): { type: QRCodeType, content: string } => {
  const lowerContent = content.toLowerCase();
  
  // Check for URL
  if (lowerContent.startsWith('http://') || lowerContent.startsWith('https://') || lowerContent.startsWith('www.')) {
    // Check for PayPal URL specifically
    if (lowerContent.includes('paypal.com/paypalme/')) {
      return { type: 'payment', content };
    }
    return { type: 'url', content };
  }
  
  // Check for WiFi
  if (lowerContent.startsWith('wifi:')) {
    return { type: 'wifi', content };
  }
  
  // Check for Email
  if (lowerContent.startsWith('mailto:')) {
    return { type: 'email', content };
  }
  
  // Check for vCard
  if (lowerContent.includes('begin:vcard')) {
    return { type: 'vcard', content };
  }
  
  // Check for Location
  if (lowerContent.startsWith('geo:')) {
    return { type: 'location', content };
  }
  
  // Check for SMS
  if (lowerContent.startsWith('sms:')) {
    return { type: 'sms', content };
  }
  
  // Check for Call
  if (lowerContent.startsWith('tel:')) {
    return { type: 'call', content };
  }
  
  // Check for Event
  if (lowerContent.includes('begin:vevent')) {
    return { type: 'event', content };
  }
  
  // Check for Bitcoin payment
  if (lowerContent.startsWith('bitcoin:')) {
    return { type: 'payment', content };
  }
  
  // Default to text if no other type matches
  return { type: 'text', content };
};

// Parse specific QR code types
export const parseQRContent = (content: string, type: QRCodeType): Record<string, string> => {
  switch (type) {
    case 'wifi': {
      const ssidMatch = content.match(/S:(.*?);/);
      const passMatch = content.match(/P:(.*?);/);
      const securityMatch = content.match(/T:(.*?);/);
      
      return {
        ssid: ssidMatch ? ssidMatch[1] : '',
        password: passMatch ? passMatch[1] : '',
        security: securityMatch ? securityMatch[1] : 'WPA',
      };
    }
    
    case 'email': {
      const emailMatch = content.match(/mailto:(.*?)(?:\?|$)/);
      const subjectMatch = content.match(/[?&]subject=([^&]*)/);
      const bodyMatch = content.match(/[?&]body=([^&]*)/);
      
      return {
        email: emailMatch ? emailMatch[1] : '',
        subject: subjectMatch ? decodeURIComponent(subjectMatch[1]) : '',
        body: bodyMatch ? decodeURIComponent(bodyMatch[1]) : '',
      };
    }
    
    case 'vcard': {
      const nameMatch = content.match(/FN:(.*?)(?:\r?\n|$)/);
      const phoneMatch = content.match(/TEL:(.*?)(?:\r?\n|$)/);
      const emailMatch = content.match(/EMAIL:(.*?)(?:\r?\n|$)/);
      const orgMatch = content.match(/ORG:(.*?)(?:\r?\n|$)/);
      const titleMatch = content.match(/TITLE:(.*?)(?:\r?\n|$)/);
      const urlMatch = content.match(/URL:(.*?)(?:\r?\n|$)/);
      const addrMatch = content.match(/ADR:;;(.*?)(?:;;;|(?:\r?\n|$))/);
      
      return {
        name: nameMatch ? nameMatch[1] : '',
        phone: phoneMatch ? phoneMatch[1] : '',
        email: emailMatch ? emailMatch[1] : '',
        organization: orgMatch ? orgMatch[1] : '',
        title: titleMatch ? titleMatch[1] : '',
        url: urlMatch ? urlMatch[1] : '',
        address: addrMatch ? addrMatch[1] : '',
      };
    }
    
    case 'location': {
      // Updated to handle address from query parameter
      const queryMatch = content.match(/\?q=([^&]*)/);
      if (queryMatch) {
        return {
          address: decodeURIComponent(queryMatch[1]),
        };
      }
      return { address: '' };
    }
    
    case 'sms': {
      const phoneMatch = content.match(/sms:(.*?)(?:\?|$)/);
      const bodyMatch = content.match(/[?&]body=([^&]*)/);
      
      return {
        phone: phoneMatch ? phoneMatch[1] : '',
        message: bodyMatch ? decodeURIComponent(bodyMatch[1]) : '',
      };
    }
    
    case 'call': {
      const phoneMatch = content.match(/tel:(.*)/);
      return {
        phone: phoneMatch ? phoneMatch[1] : '',
      };
    }
    
    case 'event': {
      const summaryMatch = content.match(/SUMMARY:(.*?)(?:\r?\n|$)/);
      const startMatch = content.match(/DTSTART:(.*?)(?:\r?\n|$)/);
      const endMatch = content.match(/DTEND:(.*?)(?:\r?\n|$)/);
      const locationMatch = content.match(/LOCATION:(.*?)(?:\r?\n|$)/);
      const descriptionMatch = content.match(/DESCRIPTION:(.*?)(?:\r?\n|$)/);
      
      return {
        title: summaryMatch ? summaryMatch[1] : '',
        start: startMatch ? startMatch[1] : '',
        end: endMatch ? endMatch[1] : '',
        location: locationMatch ? locationMatch[1] : '',
        description: descriptionMatch ? descriptionMatch[1] : '',
      };
    }
    
    case 'payment': {
      if (content.includes('paypal.com/paypalme/')) {
        const usernameMatch = content.match(/paypalme\/(.*?)(?:\/|$)/);
        const amountMatch = content.match(/paypalme\/.*?\/(.*?)(?:\/|$)/);
        
        return {
          type: 'paypal',
          recipient: usernameMatch ? usernameMatch[1] : '',
          amount: amountMatch ? amountMatch[1] : '',
        };
      } else if (content.startsWith('bitcoin:')) {
        const addressMatch = content.match(/bitcoin:(.*?)(?:\?|$)/);
        const amountMatch = content.match(/[?&]amount=([^&]*)/);
        const noteMatch = content.match(/[?&]message=([^&]*)/);
        
        return {
          type: 'bitcoin',
          recipient: addressMatch ? addressMatch[1] : '',
          amount: amountMatch ? amountMatch[1] : '',
          note: noteMatch ? decodeURIComponent(noteMatch[1]) : '',
        };
      }
      
      return { type: 'unknown' };
    }
    
    default:
      return { text: content };
  }
};

// QR Code Reading Function
export const decodeQRCode = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }

      // Create an image element to use with canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          reject(new Error('Failed to create canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            resolve(code.data);
          } else {
            reject(new Error('No QR code found in the image'));
          }
        } catch (error) {
          console.error('Error decoding QR code:', error);
          reject(new Error('Failed to decode QR code'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Storage Functions
const QR_HISTORY_KEY = 'qr-pulse-history';

export const saveToHistory = (item: QRHistoryItem): void => {
  try {
    const existingHistory = getHistory();
    
    // Limit history to 20 items
    const newHistory = [item, ...existingHistory.slice(0, 19)];
    localStorage.setItem(QR_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (err) {
    console.error('Error saving to history:', err);
  }
};

export const getHistory = (): QRHistoryItem[] => {
  try {
    const history = localStorage.getItem(QR_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (err) {
    console.error('Error getting history:', err);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(QR_HISTORY_KEY);
};

export const downloadQRCode = (dataUrl: string, format: 'png' | 'svg' = 'png', filename = 'qr-code'): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
