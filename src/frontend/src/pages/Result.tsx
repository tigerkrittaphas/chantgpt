import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressIndicator from '@/components/ProgressIndicator';
import { useChant } from '@/context/ChantContext';
import LotusIcon from '@/components/LotusIcon';
import { toast } from 'sonner';

const Result: React.FC = () => {
  const navigate = useNavigate();
  const { data, resetData } = useChant();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`คัดลอก${label}แล้ว / ${label} copied!`);
  };

  const shareToFacebook = () => {
    const text = encodeURIComponent(`บทสวดมนต์พิเศษของฉัน:\n\n${data.paliChant}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`บทสวดมนต์พิเศษของฉัน 🙏✨ #ThaiPaliChant #สวดมนต์`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToLine = () => {
    const text = encodeURIComponent(`บทสวดมนต์พิเศษของฉัน:\n\n${data.paliChant}\n\n${data.thaiTranslation}`);
    window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
  };

  const handleNewChant = () => {
    resetData();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-sky py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <LotusIcon size={48} className="mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">บทสวดมนต์ของคุณ</h1>
          <p className="text-muted-foreground">Your Personalized Chant</p>
        </div>

        {/* Progress */}
        <ProgressIndicator currentStep={4} totalSteps={4} />

        {/* Pali Chant Card */}
        <Card className="mt-6 shadow-gold border-primary/20 bg-gradient-to-b from-card to-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <span className="text-2xl">📿</span>
                บทสวดภาษาบาลี / Pali Chant
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(data.paliChant, 'บทสวดบาลี')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                คัดลอก
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background/50 rounded-xl p-6 border border-primary/10">
              <pre className="whitespace-pre-wrap font-serif text-foreground leading-relaxed text-sm md:text-base">
                {data.paliChant}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Thai Translation Card */}
        <Card className="mt-4 shadow-soft border-secondary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-secondary flex items-center gap-2">
                <span className="text-2xl">🇹🇭</span>
                คำแปลภาษาไทย / Thai Translation
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(data.thaiTranslation, 'คำแปลไทย')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                คัดลอก
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-xl p-6 border border-border">
              <pre className="whitespace-pre-wrap font-sans text-foreground leading-relaxed text-sm md:text-base">
                {data.thaiTranslation}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card className="mt-6 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground text-center">
              แชร์บทสวดมนต์ / Share Your Chant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={shareToFacebook}
                className="bg-[hsl(220,46%,48%)]/10 border-[hsl(220,46%,48%)]/30 hover:bg-[hsl(220,46%,48%)]/20"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={shareToTwitter}
                className="bg-foreground/5 border-foreground/20 hover:bg-foreground/10"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </Button>
              <Button
                variant="outline"
                onClick={shareToLine}
                className="bg-[hsl(140,60%,45%)]/10 border-[hsl(140,60%,45%)]/30 hover:bg-[hsl(140,60%,45%)]/20"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINE
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            variant="sacred"
            size="lg"
            onClick={handleNewChant}
            className="flex-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            สร้างบทสวดใหม่ / New Chant
          </Button>
          <Button
            variant="temple"
            size="lg"
            onClick={() => navigate('/donate')}
            className="flex-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            สนับสนุนเรา / Support Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Result;
