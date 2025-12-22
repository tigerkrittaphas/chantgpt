import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressIndicator from '@/components/ProgressIndicator';
import { useChant } from '@/context/ChantContext';
import LotusIcon from '@/components/LotusIcon';
import { ThemeToggle } from '@/components/ThemeToggle';

const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    setPersonalInfo
  } = useChant();
  const [name, setName] = useState(data.personalInfo.name);
  const [age, setAge] = useState(data.personalInfo.age);
  const [gender, setGender] = useState(data.personalInfo.gender);
  const [email, setEmail] = useState(data.personalInfo.email);
  const [saveInfo, setSaveInfo] = useState(data.personalInfo.saveInfo);
  const handleNext = () => {
    setPersonalInfo({
      name,
      age,
      gender,
      email,
      saveInfo
    });
    navigate('/wishes');
  };
  return <div className="min-h-screen bg-gradient-sky py-8 px-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <LotusIcon size={48} className="mx-auto mb-4 animate-glow" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">ข้อมูลส่วนตัว</h1>
          <p className="text-muted-foreground">Personal Information</p>
        </div>

        {/* Progress */}
        <ProgressIndicator currentStep={1} totalSteps={4} />

        {/* Form Card */}
        <Card className="mt-6 shadow-soft border-primary/10 rounded-3xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground">กรอกข้อมูลของคุณ</CardTitle>
            <CardDescription className="text-muted-foreground">
              ข้อมูลทั้งหมดเป็นทางเลือก แต่จะช่วยให้บทสวดมีความเฉพาะตัวมากขึ้น
              <br />
              <span className="text-xs">​All personal information is optional</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80">
                ชื่อ / Name
              </Label>
              <Input id="name" placeholder="กรุณาใส่ชื่อของคุณ" value={name} onChange={e => setName(e.target.value)} className="border-input focus:border-primary rounded-full px-5" />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground/80">
                อายุ / Age
              </Label>
              <Input id="age" type="number" placeholder="เช่น 25" value={age} onChange={e => setAge(e.target.value)} min="1" max="150" className="border-input focus:border-primary rounded-full px-5" />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-foreground/80">
                เพศ / Gender
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="border-input focus:border-primary rounded-full px-5">
                  <SelectValue placeholder="เลือกเพศ / Select gender" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="male">ชาย / Male</SelectItem>
                  <SelectItem value="female">หญิง / Female</SelectItem>
                  <SelectItem value="other">อื่นๆ / Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">ไม่ระบุ / Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email consent checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-full">
              <Checkbox id="saveInfo" checked={saveInfo} onCheckedChange={checked => setSaveInfo(checked as boolean)} className="mt-1 rounded-full" />
              <div className="space-y-1">
                <Label htmlFor="saveInfo" className="text-sm font-medium cursor-pointer text-foreground/80">
                  ฉันต้องการบันทึกข้อมูลและรับอีเมล
                </Label>
                <p className="text-xs text-muted-foreground">
                  ​I want to save my info and receive updates via email
                </p>
              </div>
            </div>

            {/* Email (shown only if checkbox is checked) */}
            {saveInfo && <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="email" className="text-foreground/80">
                  อีเมล / Email
                </Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="border-input focus:border-primary rounded-full px-5" />
              </div>}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate('/')} className="flex-1 rounded-full">
            ย้อนกลับ / Back
          </Button>
          <Button variant="sacred" size="lg" onClick={handleNext} className="flex-1 rounded-full">
            ถัดไป / Next
          </Button>
        </div>
      </div>
    </div>;
};
export default PersonalInfo;