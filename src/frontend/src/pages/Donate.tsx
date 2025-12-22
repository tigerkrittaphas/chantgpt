import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LotusIcon from '@/components/LotusIcon';
import { toast } from 'sonner';
const donationMethods = [{
  id: 'promptpay',
  name: 'PromptPay',
  description: 'โอนเงินผ่าน QR Code',
  englishDesc: 'Transfer via QR Code',
  icon: '📱',
  details: 'สแกน QR Code เพื่อโอนเงิน'
}, {
  id: 'bank',
  name: 'โอนผ่านธนาคาร',
  description: 'Bank Transfer',
  englishDesc: 'Direct bank transfer',
  icon: '🏦',
  details: 'ธนาคารกสิกรไทย\nชื่อบัญชี: Thai Pali Chant\nเลขที่บัญชี: XXX-X-XXXXX-X'
}, {
  id: 'truemoney',
  name: 'TrueMoney Wallet',
  description: 'โอนผ่านทรูมันนี่',
  englishDesc: 'TrueMoney transfer',
  icon: '💳',
  details: 'หมายเลข: 08X-XXX-XXXX'
}];
const donationAmounts = [50, 100, 200, 500, 1000];
const Donate: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);
  const handleDonate = () => {
    if (!selectedAmount || !selectedMethod) {
      toast.error('กรุณาเลือกจำนวนเงินและวิธีการบริจาค');
      return;
    }
    toast.success('ขอบคุณสำหรับการสนับสนุน! / Thank you for your support!');
  };
  return <div className="min-h-screen bg-gradient-sky py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <LotusIcon size={64} className="mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">สนับสนุนเรา</h1>
          <p className="text-muted-foreground">Support Our Project</p>
        </div>

        {/* Introduction */}
        <Card className="mb-6 shadow-soft border-primary/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-foreground leading-relaxed">
                การบริจาคของคุณจะช่วยให้เราพัฒนาแอปพลิเคชันนี้ต่อไป 
                และขยายความสามารถในการสร้างบทสวดมนต์ที่มีความหมายสำหรับทุกคน
              </p>
              <p className="text-muted-foreground text-sm">
                Your donation helps us continue developing this application 
                and expand our ability to create meaningful chants for everyone.
              </p>
              <div className="flex justify-center">
                <span className="text-3xl">🙏</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Amount */}
        <Card className="mb-6 shadow-soft border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg text-secondary">เลือกจำนวนเงิน / Select Amount</CardTitle>
            <CardDescription>เลือกจำนวนที่คุณต้องการบริจาค</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {donationAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 font-semibold
                    ${selectedAmount === amount 
                      ? 'border-primary bg-primary/10 text-primary shadow-gold' 
                      : 'border-border bg-card text-foreground hover:border-primary/50'}`}
                >
                  ฿{amount}
                </button>
              ))}
            </div>
            
          </CardContent>
        </Card>

        {/* Donation Methods */}
        <Card className="mb-6 shadow-soft border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg text-secondary">เลือกวิธีการบริจาค / Payment Method</CardTitle>
            <CardDescription>เลือกช่องทางที่สะดวกสำหรับคุณ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {donationMethods.map(method => <button key={method.id} onClick={() => setSelectedMethod(method.id)} className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${selectedMethod === method.id ? 'border-primary bg-primary/10 shadow-gold' : 'border-border bg-card hover:border-primary/50'}`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{method.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.englishDesc}</p>
                    {selectedMethod === method.id && <div className="mt-3 p-3 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {method.details}
                        </pre>
                      </div>}
                  </div>
                </div>
              </button>)}
          </CardContent>
        </Card>

        {/* Donate Button */}
        <Button variant="sacred" size="xl" onClick={handleDonate} className="w-full mb-6" disabled={!selectedAmount || !selectedMethod}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          บริจาค {selectedAmount ? `฿${selectedAmount}` : ''} / Donate
        </Button>

        {/* Thank you note */}
        <div className="text-center p-6 bg-secondary/5 rounded-2xl border border-secondary/10">
          <p className="text-secondary font-medium mb-2">
            ขอบคุณที่สนับสนุน
          </p>
          <p className="text-muted-foreground text-sm">
            Thank you for your generosity. May your kindness bring you blessings.
          </p>
          <p className="text-2xl mt-4">🙏✨</p>
        </div>

        {/* Back button */}
        <div className="mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate('/result')} className="w-full">
            ← กลับไปหน้าผลลัพธ์ / Back to Result
          </Button>
        </div>
      </div>
    </div>;
};
export default Donate;