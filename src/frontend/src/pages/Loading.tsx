import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChant } from '@/context/ChantContext';
import LotusIcon from '@/components/LotusIcon';
const Loading: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    setChantResult
  } = useChant();
  useEffect(() => {
    const generateChant = async () => {
      // Simulate API call delay (will be replaced with actual LLM call)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock response - this will be replaced with actual LLM response
      const mockPaliChant = `นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ
      
สุขี โหตุ ${data.personalInfo.name || 'สาธุชน'}
อายุ วัณโณ สุขัง พะลัง
ปัญญาวุฒิ สมาธิ จ

${data.wishes.includes('health') ? 'อาโรคยา ปะระมา ลาภา\nโรคา สัพพา วินัสสันตุ\n' : ''}
${data.wishes.includes('wealth') ? 'ธะนัง มะหาลาโภ โหตุ\nโภคา สัพพา สะมิชฌันตุ\n' : ''}
${data.wishes.includes('career') ? 'กัมมะวิชชา สิชฌันตุ\nวิริยะ สัมปะทา โหตุ\n' : ''}
${data.wishes.includes('love') ? 'เมตตา จิตตัง สะมาธิสา\nปิยะ มะนาปา โหตุ\n' : ''}
${data.wishes.includes('education') ? 'ปัญญา วัฒนัง โหตุ\nวิชชา จะระณะ สัมปันโน\n' : ''}
${data.wishes.includes('family') ? 'กุลัง สุขิตัง โหตุ\nมาตาปิตา สุขิตา โหนตุ\n' : ''}
${data.wishes.includes('peace') ? 'สันติ สุขัง โหตุ\nนิพพานะ สุขัง อะนุตตะรัง\n' : ''}
${data.wishes.includes('success') ? 'สิชฌันตุ เม มะโนรถา\nสัพพะกัมมัง ปะสิชฌันตุ\n' : ''}
${data.wishes.includes('protection') ? 'อะภะยัง โหตุ สัพพะทา\nเทวะตา อะภิปาเลนตุ\n' : ''}
${data.wishes.includes('friendship') ? 'มิตตา สุขิตา โหนตุ\nสะหายะ สัมปันโน\n' : ''}

สาธุ สาธุ สาธุ อะนุโมทามิ`;
      const mockThaiTranslation = `ขอนอบน้อมแด่พระผู้มีพระภาคเจ้า พระอรหันต์ ผู้ตรัสรู้เองโดยชอบ

ขอให้ ${data.personalInfo.name || 'ท่าน'} มีความสุข
ขอให้มีอายุยืน ผิวพรรณงาม มีความสุข มีกำลัง
ขอให้มีปัญญาเจริญ และมีสมาธิ

${data.wishes.includes('health') ? 'ความไม่มีโรคเป็นลาภอันประเสริฐ\nขอให้โรคทั้งปวงจงพินาศไป\n' : ''}
${data.wishes.includes('wealth') ? 'ขอให้มีทรัพย์อันยิ่งใหญ่\nขอให้โภคทรัพย์ทั้งปวงจงสำเร็จ\n' : ''}
${data.wishes.includes('career') ? 'ขอให้สำเร็จในการงาน\nขอให้มีความเพียรอันสมบูรณ์\n' : ''}
${data.wishes.includes('love') ? 'ขอให้จิตใจเปี่ยมด้วยเมตตา\nขอให้เป็นที่รักและน่าพอใจ\n' : ''}
${data.wishes.includes('education') ? 'ขอให้ปัญญาเจริญงอกงาม\nขอให้สมบูรณ์ด้วยวิชาและความประพฤติ\n' : ''}
${data.wishes.includes('family') ? 'ขอให้ครอบครัวมีความสุข\nขอให้บิดามารดามีความสุข\n' : ''}
${data.wishes.includes('peace') ? 'ขอให้มีความสงบสุข\nความสุขแห่งนิพพานเป็นสุขอันยอดเยี่ยม\n' : ''}
${data.wishes.includes('success') ? 'ขอให้ความปรารถนาทั้งหลายสำเร็จ\nขอให้การงานทั้งปวงสำเร็จลุล่วง\n' : ''}
${data.wishes.includes('protection') ? 'ขอให้ปราศจากภัยตลอดกาล\nขอให้เทวดาคุ้มครองรักษา\n' : ''}
${data.wishes.includes('friendship') ? 'ขอให้มิตรสหายมีความสุข\nขอให้สมบูรณ์ด้วยเพื่อนที่ดี\n' : ''}

${data.customWish ? `\n(ความปรารถนาพิเศษ: ${data.customWish})\n` : ''}

สาธุ สาธุ สาธุ ข้าพเจ้าขออนุโมทนา`;
      setChantResult(mockPaliChant, mockThaiTranslation);
      navigate('/result');
    };
    generateChant();
  }, [data, navigate, setChantResult]);
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