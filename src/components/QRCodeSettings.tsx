import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { QRCodeType, QROptions } from "@/lib/qr-generator";
import { Link, Mail, Wifi, QrCode, MapPin, Phone, MessageSquare, Calendar, CreditCard } from "lucide-react";
import QRCodeUpload from "@/components/QRCodeUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QRCodeSettingsProps {
  onGenerate: (content: string, type: QRCodeType, options: QROptions) => void;
  onUpload: (file: File) => Promise<void>;
}

export default function QRCodeSettings({ onGenerate, onUpload }: QRCodeSettingsProps) {
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

  // Location specific states
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  // SMS specific states
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  // Call specific state
  const [callPhone, setCallPhone] = useState("");

  // Event specific states
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  // Payment specific states
  const [paymentType, setPaymentType] = useState<"paypal" | "bitcoin">("paypal");
  const [paymentRecipient, setPaymentRecipient] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentNote, setPaymentNote] = useState("");

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
      case "location":
        finalContent = locationQuery ? 
          `geo:0,0?q=${encodeURIComponent(locationQuery)}` :
          `geo:${latitude},${longitude}`;
        break;
      case "sms":
        finalContent = `sms:${smsPhone}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ''}`;
        break;
      case "call":
        finalContent = `tel:${callPhone}`;
        break;
      case "event":
        finalContent = `BEGIN:VEVENT
SUMMARY:${eventTitle}
DTSTART:${eventStart.replace(/-/g, '').replace(/:/g, '')}
DTEND:${eventEnd.replace(/-/g, '').replace(/:/g, '')}
${eventLocation ? `LOCATION:${eventLocation}\n` : ''}${eventDescription ? `DESCRIPTION:${eventDescription}\n` : ''}END:VEVENT`;
        break;
      case "payment":
        if (paymentType === "paypal") {
          finalContent = `https://www.paypal.com/paypalme/${paymentRecipient}${paymentAmount ? `/${paymentAmount}` : ''}`;
        } else {
          finalContent = `bitcoin:${paymentRecipient}${paymentAmount ? `?amount=${paymentAmount}` : ''}${paymentNote ? `&message=${encodeURIComponent(paymentNote)}` : ''}`;
        }
        break;
    }
    
    onGenerate(finalContent, type, options);
  };

  return (
    <div className="w-full space-y-4">
      <QRCodeUpload onUpload={onUpload} />

      <Tabs defaultValue="url" className="w-full" onValueChange={(value) => setType(value as QRCodeType)}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">URL</span>
          </TabsTrigger>
          <TabsTrigger value="wifi" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">WiFi</span>
          </TabsTrigger>
          <TabsTrigger value="vcard" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">vCard</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
          <TabsTrigger value="more" className="flex items-center gap-2">
            <span>More</span>
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
        
        {/* WiFi Tab Content */}
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

        {/* Email Tab */}
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

        {/* vCard Tab */}
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

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationQuery">Search for a place</Label>
            <Input
              id="locationQuery"
              placeholder="e.g., Eiffel Tower, Paris, France"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <p className="text-xs text-muted-foreground">Or enter coordinates directly:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                placeholder="e.g., 48.8584"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                placeholder="e.g., 2.2945"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smsPhone">Phone Number</Label>
            <Input
              id="smsPhone"
              placeholder="+12345678900"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smsMessage">Message (Optional)</Label>
            <Input
              id="smsMessage"
              placeholder="Enter message here"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>

        {/* Call Tab */}
        <TabsContent value="call" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="callPhone">Phone Number</Label>
            <Input
              id="callPhone"
              placeholder="+12345678900"
              value={callPhone}
              onChange={(e) => setCallPhone(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>

        {/* Event Tab */}
        <TabsContent value="event" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title</Label>
            <Input
              id="eventTitle"
              placeholder="Meeting, Conference, etc."
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventStart">Start Date & Time</Label>
              <Input
                id="eventStart"
                type="datetime-local"
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventEnd">End Date & Time</Label>
              <Input
                id="eventEnd"
                type="datetime-local"
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventLocation">Location (Optional)</Label>
            <Input
              id="eventLocation"
              placeholder="Venue or address"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Description (Optional)</Label>
            <Input
              id="eventDescription"
              placeholder="Event details"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select value={paymentType} onValueChange={(val) => setPaymentType(val as "paypal" | "bitcoin")}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bitcoin">Bitcoin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentRecipient">
              {paymentType === "paypal" ? "PayPal Username" : "Bitcoin Address"}
            </Label>
            <Input
              id="paymentRecipient"
              placeholder={paymentType === "paypal" ? "username" : "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}
              value={paymentRecipient}
              onChange={(e) => setPaymentRecipient(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Amount (Optional)</Label>
            <Input
              id="paymentAmount"
              placeholder="10.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="bg-background/50 border-white/10"
            />
          </div>
          {paymentType === "bitcoin" && (
            <div className="space-y-2">
              <Label htmlFor="paymentNote">Note (Optional)</Label>
              <Input
                id="paymentNote"
                placeholder="Payment for services"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          )}
        </TabsContent>

        {/* More Tab - Navigation to other tabs */}
        <TabsContent value="more">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex gap-2 items-center justify-center p-4 h-auto"
              onClick={() => setType("email")}
            >
              <Mail className="h-5 w-5" />
              <span>Email</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex gap-2 items-center justify-center p-4 h-auto"
              onClick={() => setType("sms")}
            >
              <MessageSquare className="h-5 w-5" />
              <span>SMS</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex gap-2 items-center justify-center p-4 h-auto"
              onClick={() => setType("call")}
            >
              <Phone className="h-5 w-5" />
              <span>Call</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex gap-2 items-center justify-center p-4 h-auto"
              onClick={() => setType("event")}
            >
              <Calendar className="h-5 w-5" />
              <span>Event</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex gap-2 items-center justify-center p-4 h-auto"
              onClick={() => setType("payment")}
            >
              <CreditCard className="h-5 w-5" />
              <span>Payment</span>
            </Button>
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
