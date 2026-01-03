import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChant } from '@/context/ChantContext';
import LotusIcon from '@/components/LotusIcon';
import { toast } from 'sonner';
import { wishLookup } from '@/data/wishes';

const API_BASE_URL = (import.meta.env.VITE_LLM_API_BASE_URL ?? '/llm-api').replace(/\/$/, '');

const normalizeWishes = (wishIds: string[], customWish: string) => {
  const mapped = wishIds.map((wishId) => wishLookup[wishId]?.english ?? wishId);
  const custom = customWish
    .split('|')
    .map((wish) => wish.trim())
    .filter(Boolean);
  return [...mapped, ...custom];
};

const parseChantOutput = (output: string) => {
  const cleaned = output.trim();
  if (!cleaned) {
    return { pali: '', translation: '' };
  }

  const extract = (label: string) => {
    const regex = new RegExp(`${label}\\s*\\{\\{([\\s\\S]*?)\\}\\}`, 'i');
    const match = cleaned.match(regex);
    return match ? match[1].trim() : '';
  };

  const pali = extract('PALI');
  const translation = extract('TRANSLATION');
  if (pali || translation) {
    return { pali, translation };
  }

  const translationSplit = cleaned.split(/TRANSLATION\s*[:\-]?/i);
  if (translationSplit.length > 1) {
    return {
      pali: translationSplit[0].trim(),
      translation: translationSplit.slice(1).join('TRANSLATION').trim(),
    };
  }

  const thaiSplit = cleaned.split(/คำแปล\s*[:\-]?/);
  if (thaiSplit.length > 1) {
    return {
      pali: thaiSplit[0].trim(),
      translation: thaiSplit.slice(1).join('คำแปล').trim(),
    };
  }

  return { pali: cleaned, translation: '' };
};
const Loading: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    setChantResult
  } = useChant();
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const generateChant = async () => {
      const wishes = normalizeWishes(data.wishes, data.customWish);
      if (wishes.length === 0) {
        toast.error('กรุณาเลือกความปรารถนาอย่างน้อย 1 ข้อ');
        navigate('/wishes');
        return;
      }

      const name = data.personalInfo.name.trim() || 'สาธุชน';
      try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            wishes,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errorMessage = `LLM API error (${response.status})`;
          try {
            const errorData = await response.json();
            if (typeof errorData?.detail === 'string') {
              errorMessage = errorData.detail;
            }
          } catch {
            // Ignore JSON parsing errors for non-JSON responses.
          }
          throw new Error(errorMessage);
        }

        const payload = await response.json();
        const outputText = typeof payload?.output === 'string' ? payload.output : '';
        const parsed = parseChantOutput(outputText);
        const paliChant = parsed.pali || outputText.trim() || 'ไม่พบบทสวดจากระบบ';
        const thaiTranslation = parsed.translation;

        if (!isActive) return;
        setChantResult(paliChant, thaiTranslation);
        navigate('/result');
      } catch (error) {
        if (!isActive) return;
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างบทสวด';
        toast.error(message);
        navigate('/wishes');
      }
    };

    generateChant();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [data.customWish, data.personalInfo.name, data.wishes, navigate, setChantResult]);
  return <div className="min-h-screen bg-gradient-temple flex flex-col items-center justify-center px-4 bg-secondary">
      {/* Animated lotus */}
      <div className="relative mb-8">
        <div className="animate-spin-slow">
          <LotusIcon size={120} className="opacity-90" />
        </div>
        <div className="absolute inset-0 animate-pulse">
          <LotusIcon size={120} className="opacity-40" />
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary-foreground mb-4">
          กำลังสร้างบทสวดมนต์
        </h2>
        <p className="text-secondary-foreground/80 mb-8">
          Generating your personalized chant...
        </p>

        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{
          animationDelay: '0s'
        }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{
          animationDelay: '0.1s'
        }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{
          animationDelay: '0.2s'
        }} />
        </div>

        {/* Inspirational quote */}
        <div className="mt-12 max-w-md mx-auto">
          <p className="text-secondary-foreground/60 italic text-sm">
            "ธรรมะย่อมรักษาผู้ประพฤติธรรม"
          </p>
          <p className="text-secondary-foreground/40 text-xs mt-1">
            "Dhamma protects those who practice Dhamma"
          </p>
        </div>
      </div>
    </div>;
};
export default Loading;
