import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { QRCodeType, QROptions } from "@/lib/qr-generator";
import { Link, Mail, Wifi, QrCode } from "lucide-react";

interface QRCodeSettingsProps {
  onGenerate: (content: string, type: QRCodeType, options: QROptions) => void;
}

export default function QRCodeSettings({ onGenerate }: QRCodeSettingsProps) {
  const [type, setType] = useState<QRCodeType>("url");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<QROptions>({
    size: 300,
    foreground: "#8b5cf6",
    background: "#ffffff",
    margin: 1,
    errorCorrectionLevel: "M",
  });
  
  // WiFi specific states
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  
  // Email specific states
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  // vCard specific states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vCardEmail, setVCardEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [address, setAddress] = useState("");

  const handleColorChange = (key: 'foreground' | 'background', value: string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSizeChange = (value: number[]) => {
    setOptions(prev => ({ ...prev, size: value[0] }));
  };

  const handleGenerate = () => {
    let finalContent = "";
    
    switch(type) {
      case "url":
      case "text":
        finalContent = content;
        break;
      case "wifi":
        finalContent = `WIFI:S:${ssid};T:WPA;P:${password};;`;
        break;
      case "email":
        finalContent = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}${emailBody ? `${subject ? "&" : "?"}body=${encodeURIComponent(emailBody)}` : ""}`;
        break;
      case "vcard":
        finalContent = `BEGIN:VCARD
VERSION:3.0
N:${name};;;
FN:${name}
${phone ? `TEL:${phone}\n` : ""}${vCardEmail ? `EMAIL:${vCardEmail}\n` : ""}${organization ? `ORG:${organization}\n` : ""}${title ? `TITLE:${title}\n` : ""}${url ? `URL:${url}\n` : ""}${address ? `ADR:;;${address};;;\n` : ""}END:VCARD`;
        break;
    }
    
    onGenerate(finalContent, type, options);
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="url" className="w-full" onValueChange={(value) => setType(value as QRCodeType)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">URL</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="wifi" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">WiFi</span>
          </TabsTrigger>
          <TabsTrigger value="vcard" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">vCard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Enter URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              placeholder="Meeting Request"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailBody">Body (Optional)</Label>
            <Input
              id="emailBody"
              placeholder="Hello, I'd like to schedule a meeting..."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>

        <TabsContent value="wifi" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ssid">Network Name (SSID)</Label>
            <Input
              id="ssid"
              placeholder="Your WiFi Network"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="WiFi Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>

        <TabsContent value="vcard" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vCardEmail">Email</Label>
              <Input
                id="vCardEmail"
                placeholder="john@example.com"
                value={vCardEmail}
                onChange={(e) => setVCardEmail(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Company</Label>
              <Input
                id="organization"
                placeholder="Acme Inc."
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="Product Manager"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Website</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Enter Text</Label>
            <Input
              id="text"
              placeholder="Enter your text here"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4 mt-6 pt-4 border-t border-white/10">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="size">Size ({options.size}px)</Label>
          </div>
          <Slider
            id="size"
            min={100}
            max={500}
            step={10}
            value={[options.size || 300]}
            onValueChange={handleSizeChange}
            className="py-4"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foreground">QR Color</Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-8 h-8 rounded-full border border-white/20 overflow-hidden"
                style={{ backgroundColor: options.foreground }}
              />
              <Input
                id="foreground"
                type="color"
                value={options.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="w-full h-8 cursor-pointer bg-background/50 border-white/10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="background">Background Color</Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-8 h-8 rounded-full border border-white/20 overflow-hidden"
                style={{ backgroundColor: options.background }}
              />
              <Input
                id="background"
                type="color"
                value={options.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-full h-8 cursor-pointer bg-background/50 border-white/10"
              />
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all"
      >
        Generate QR Code
      </Button>
    </div>
  );
}
