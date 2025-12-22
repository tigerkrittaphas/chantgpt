import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PersonalInfo {
  name: string;
  age: string;
  gender: string;
  email: string;
  saveInfo: boolean;
}

interface ChantData {
  personalInfo: PersonalInfo;
  wishes: string[];
  customWish: string;
  paliChant: string;
  thaiTranslation: string;
}

interface ChantContextType {
  data: ChantData;
  setPersonalInfo: (info: PersonalInfo) => void;
  setWishes: (wishes: string[], customWish: string) => void;
  setChantResult: (pali: string, thai: string) => void;
  resetData: () => void;
}

const initialData: ChantData = {
  personalInfo: {
    name: '',
    age: '',
    gender: '',
    email: '',
    saveInfo: false,
  },
  wishes: [],
  customWish: '',
  paliChant: '',
  thaiTranslation: '',
};

const ChantContext = createContext<ChantContextType | undefined>(undefined);

export const ChantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ChantData>(initialData);

  const setPersonalInfo = (info: PersonalInfo) => {
    setData(prev => ({ ...prev, personalInfo: info }));
  };

  const setWishes = (wishes: string[], customWish: string) => {
    setData(prev => ({ ...prev, wishes, customWish }));
  };

  const setChantResult = (pali: string, thai: string) => {
    setData(prev => ({ ...prev, paliChant: pali, thaiTranslation: thai }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return (
    <ChantContext.Provider value={{ data, setPersonalInfo, setWishes, setChantResult, resetData }}>
      {children}
    </ChantContext.Provider>
  );
};

export const useChant = () => {
  const context = useContext(ChantContext);
  if (context === undefined) {
    throw new Error('useChant must be used within a ChantProvider');
  }
  return context;
};
