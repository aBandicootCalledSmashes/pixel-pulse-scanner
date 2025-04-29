
import QRCode from 'qrcode';

export type QRCodeType = 'text' | 'url' | 'email' | 'wifi' | 'vcard';

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
