export interface WishOption {
  id: string;
  label: string;
  english: string;
  icon: string;
}

export const wishOptions: WishOption[] = [
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

export const wishLookup = wishOptions.reduce<Record<string, WishOption>>((acc, wish) => {
  acc[wish.id] = wish;
  return acc;
}, {});
