import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressIndicator from '@/components/ProgressIndicator';
import { useChant } from '@/context/ChantContext';
import LotusIcon from '@/components/LotusIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

const wishOptions = [
  { id: 'health', label: 'สุขภาพ', english: 'Health', icon: '💪' },
  { id: 'wealth', label: 'ความมั่งคั่ง', english: 'Wealth', icon: '💰' },
  { id: 'career', label: 'หน้าที่การงาน', english: 'Career', icon: '💼' },
  { id: 'love', label: 'ความรัก', english: 'Love', icon: '❤️' },
  { id: 'education', label: 'การศึกษา', english: 'Education', icon: '📚' },
  { id: 'friendship', label: 'มิตรภาพ', english: 'Friendship', icon: '🤝' },
  { id: 'family', label: 'ครอบครัว', english: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'peace', label: 'ความสงบ', english: 'Peace', icon: '🕊️' },
  { id: 'success', label: 'ความสำเร็จ', english: 'Success', icon: '🏆' },
  { id: 'protection', label: 'การปกป้องคุ้มครอง', english: 'Protection', icon: '🛡️' },
];

const MAX_WISHES = 5;

const Wishes: React.FC = () => {
  const navigate = useNavigate();
  const { data, setWishes } = useChant();
  
  const [selectedWishes, setSelectedWishes] = useState<string[]>(data.wishes);
  const [customWishes, setCustomWishes] = useState<string[]>(
    data.customWish ? data.customWish.split('|').filter(w => w.trim()) : []
  );
  const [customWishInput, setCustomWishInput] = useState('');

  const totalWishes = selectedWishes.length + customWishes.length;
  const isAtLimit = totalWishes >= MAX_WISHES;

  const toggleWish = (wishId: string) => {
    setSelectedWishes(prev => {
      if (prev.includes(wishId)) {
        return prev.filter(id => id !== wishId);
      }
      if (totalWishes >= MAX_WISHES) return prev;
      return [...prev, wishId];
    });
  };

  const addCustomWish = () => {
    if (isAtLimit) return;
    const trimmed = customWishInput.trim();
    if (trimmed && !customWishes.includes(trimmed)) {
      setCustomWishes(prev => [...prev, trimmed]);
      setCustomWishInput('');
    }
  };

  const removeCustomWish = (wish: string) => {
    setCustomWishes(prev => prev.filter(w => w !== wish));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomWish();
    }
  };

  const handleNext = () => {
    setWishes(selectedWishes, customWishes.join('|'));
    navigate('/loading');
  };

  const hasWishes = selectedWishes.length > 0 || customWishes.length > 0;

  return (
    <div className="min-h-screen bg-gradient-sky py-8 px-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <LotusIcon size={48} className="mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">ความปรารถนาของคุณ</h1>
          <p className="text-muted-foreground">Your Wishes</p>
        </div>

        {/* Progress */}
        <ProgressIndicator currentStep={2} totalSteps={4} />

        {/* Wish Selection Card */}
        <Card className="mt-6 shadow-soft border-primary/10 rounded-3xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground">เลือกสิ่งที่คุณปรารถนา</CardTitle>
            <CardDescription className="text-muted-foreground">
              เลือกได้สูงสุด {MAX_WISHES} ข้อ ({totalWishes}/{MAX_WISHES})
              <br />
              <span className="text-xs">Select up to {MAX_WISHES} wishes</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wish Options Grid - Circular Bubbles */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {wishOptions.map((wish) => {
                const isSelected = selectedWishes.includes(wish.id);
                const isDisabled = !isSelected && isAtLimit;
                return (
                  <button
                    key={wish.id}
                    onClick={() => toggleWish(wish.id)}
                    disabled={isDisabled}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-full aspect-square transition-all duration-300",
                      isSelected
                        ? "border-2 border-primary bg-primary/10 shadow-gold"
                        : "border-2 border-border bg-card",
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-gold hover:-translate-y-1 hover:border-primary/50"
                    )}
                  >
                    <div className="text-3xl mb-1">{wish.icon}</div>
                    <div className="font-medium text-foreground text-sm text-center">{wish.label}</div>
                    <div className="text-xs text-muted-foreground text-center">{wish.english}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Wish Input */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Label htmlFor="customWish" className="text-foreground/80 font-medium">
                ความปรารถนาอื่นๆ / Other wishes
              </Label>
              <div className="flex gap-2">
                <Input
                  id="customWish"
                  placeholder="พิมพ์ความปรารถนา... / Type your wish..."
                  value={customWishInput}
                  onChange={(e) => setCustomWishInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-input focus:border-primary rounded-full px-5"
                />
                <Button
                  type="button"
                  variant="sacred"
                  size="icon"
                  onClick={addCustomWish}
                  disabled={!customWishInput.trim() || isAtLimit}
                  className="rounded-full shrink-0"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isAtLimit 
                  ? "ถึงขีดจำกัดแล้ว / Limit reached"
                  : "กด Enter หรือปุ่ม + เพื่อเพิ่ม / Press Enter or + to add"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Selected summary */}
        {(selectedWishes.length > 0 || customWishes.length > 0) && (
          <div className="mt-4 p-4 bg-primary/5 rounded-3xl border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2 text-center">ที่เลือก / Selected:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedWishes.map(wishId => {
                const wish = wishOptions.find(w => w.id === wishId);
                return wish ? (
                  <span key={wishId} className="px-3 py-1 bg-primary/10 rounded-full text-sm text-foreground">
                    {wish.icon} {wish.label}
                  </span>
                ) : null;
              })}
              {customWishes.map((wish, index) => (
                <span 
                  key={`custom-${index}`} 
                  className="px-3 py-1 bg-primary/10 rounded-full text-sm text-foreground flex items-center gap-1"
                >
                  ✨ {wish}
                  <button
                    onClick={() => removeCustomWish(wish)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/personal-info')}
            className="flex-1 rounded-full"
          >
            ย้อนกลับ / Back
          </Button>
          <Button
            variant="sacred"
            size="lg"
            onClick={handleNext}
            disabled={!hasWishes}
            className="flex-1 rounded-full"
          >
            สร้างบทสวด / Generate
          </Button>
        </div>

        {!hasWishes && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            กรุณาเลือกความปรารถนาอย่างน้อย 1 ข้อ
            <br />
            Please select at least one wish
          </p>
        )}
      </div>
    </div>
  );
};

export default Wishes;
