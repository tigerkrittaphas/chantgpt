import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LotusIcon from '@/components/LotusIcon';
import { ThemeToggle } from '@/components/ThemeToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-sky flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 opacity-20 animate-float">
          <LotusIcon size={80} />
        </div>
        <div className="absolute top-20 right-20 opacity-15 animate-float" style={{
        animationDelay: '1s'
      }}>
          <LotusIcon size={60} />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10 animate-float" style={{
        animationDelay: '2s'
      }}>
          <LotusIcon size={100} />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20 animate-float" style={{
        animationDelay: '0.5s'
      }}>
          <LotusIcon size={70} />
        </div>
      </div>

      {/* Main content */}
      <div className="text-center z-10 max-w-2xl mx-auto">
        {/* Main lotus icon */}
        <div className="mb-8 animate-glow">
          <LotusIcon size={120} className="mx-auto" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient-sacred">บทสวดมนต์ประจำตัว</h1>
        <p className="text-lg md:text-xl mb-2 text-foreground">Personalized Prayer specifically for you</p>

        {/* Description */}
        <p className="text-muted-foreground text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          สร้างบทสวดมนต์ที่ออกแบบมาเฉพาะสำหรับคุณ
          <br />
          <span className="text-sm">Create personalized prayer tailored to your wishes</span>
        </p>

        {/* CTA Button */}
        <Button variant="sacred" size="xl" onClick={() => navigate('/personal-info')} className="group">
          <span>เริ่มต้น</span>
          <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>

        <p className="text-sm text-muted-foreground mt-6">
          Click here to start your spiritual journey
        </p>
      </div>

      {/* Footer note */}
      <div className="absolute bottom-8 text-center text-sm text-muted-foreground">
        <p>พลังแห่งศรัทธา • Power of Faith</p>
      </div>
    </div>;
};
export default Landing;