import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, MessageCircle, Mail, Copy, Download, FileText, Smartphone, Link, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface UniversalShareProps {
  content: string;
  title?: string;
  filename?: string;
  children?: React.ReactNode;
}

export const UniversalShare: React.FC<UniversalShareProps> = ({ 
  content, 
  title = "Share Content", 
  filename = "shared-content.txt",
  children 
}) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  // Safety check for content
  const safeContent = content || '';
  const safeTitle = title || 'Share Content';
  const safeFilename = filename || 'shared-content.txt';

  useEffect(() => {
    // Check if Web Share API is supported
    try {
      setHasNativeShare(
        typeof navigator !== 'undefined' && 
        navigator.share && 
        typeof navigator.canShare === 'function'
      );
    } catch (error) {
      console.log('Web Share API not supported:', error);
      setHasNativeShare(false);
    }
  }, []);

  const shareViaNative = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: safeTitle,
          text: safeContent,
          url: window.location.href
        });
        setIsOpen(false);
      } else {
        console.log('Native share not available');
        setIsOpen(false);
      }
    } catch (error) {
      console.log('Native share cancelled or failed:', error);
      setIsOpen(false);
    }
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(safeContent)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(safeContent)}`;
    window.open(telegramUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(safeTitle)}&body=${encodeURIComponent(safeContent)}`;
    window.open(emailUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(safeContent)}`;
    window.open(smsUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(safeContent)}`;
    window.open(twitterUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(safeContent)}`;
    window.open(facebookUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(safeContent)}`;
    window.open(linkedinUrl, '_blank');
    setIsOpen(false);
  };

  const shareViaLink = () => {
    const linkUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(safeContent)}`;
    window.open(linkUrl, '_blank');
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(safeContent);
      toast({
        title: "Copied to Clipboard",
        description: "Content has been copied to your clipboard",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([safeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File Downloaded",
      description: "Content has been downloaded as a text file",
    });
    setIsOpen(false);
  };

  const shareOptions = [
    // Native share (if available)
    ...(hasNativeShare ? [{
      name: 'Share',
      icon: Smartphone,
      action: shareViaNative,
      color: 'text-primary hover:text-primary/80'
    }] : []),
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: shareViaWhatsApp,
      color: 'text-green-600 hover:text-green-700'
    },
    {
      name: 'Telegram',
      icon: MessageCircle,
      action: shareViaTelegram,
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: shareViaTwitter,
      color: 'text-sky-600 hover:text-sky-700'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: shareViaFacebook,
      color: 'text-blue-700 hover:text-blue-800'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: shareViaLinkedIn,
      color: 'text-blue-800 hover:text-blue-900'
    },
    {
      name: 'Email',
      icon: Mail,
      action: shareViaEmail,
      color: 'text-gray-600 hover:text-gray-700'
    },
    {
      name: 'SMS',
      icon: MessageCircle,
      action: shareViaSMS,
      color: 'text-purple-600 hover:text-purple-700'
    },
    {
      name: 'Copy Text',
      icon: Copy,
      action: copyToClipboard,
      color: 'text-orange-600 hover:text-orange-700'
    },
    {
      name: 'Download',
      icon: Download,
      action: downloadAsFile,
      color: 'text-indigo-600 hover:text-indigo-700'
    }
  ];

  // Safety check - don't render if there are critical errors
  if (!safeContent) {
    return children || (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <Share2 className="h-4 w-4" />
        {t.share}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            {t.share}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Share2 className="h-5 w-5" />
            {t.shareVia}
          </DialogTitle>
          <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
            Choose how you want to share this content
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              onClick={option.action}
              className={`flex items-center gap-2 ${option.color} ${isRTL ? 'flex-row-reverse' : ''} h-auto py-3 px-3`}
            >
              <option.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{option.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
