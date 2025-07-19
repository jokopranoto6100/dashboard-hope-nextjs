// src/app/(dashboard)/jadwal/jadwal.utils.ts

export const isLeapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

export const getDaysInYear = (year: number): number => isLeapYear(year) ? 366 : 365;

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const getDurationInDays = (start: Date, end: Date): number => {
    const diff = end.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
};

// Enhanced color palette with better contrast and accessibility
export const colorVariants: { [key: string]: string } = {
  // Core colors with better accessibility
  blue: 'bg-blue-500 hover:bg-blue-600 border-blue-700 shadow-blue-200/50',
  green: 'bg-green-500 hover:bg-green-600 border-green-700 shadow-green-200/50',
  amber: 'bg-amber-500 hover:bg-amber-600 border-amber-700 shadow-amber-200/50',
  sky: 'bg-sky-500 hover:bg-sky-600 border-sky-700 shadow-sky-200/50',
  slate: 'bg-slate-400 hover:bg-slate-500 border-slate-600 shadow-slate-200/50',
  
  // Extended colors for better categorization
  mint: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 shadow-emerald-200/50',
  coral: 'bg-rose-500 hover:bg-rose-600 border-rose-700 shadow-rose-200/50',
  lavender: 'bg-purple-500 hover:bg-purple-600 border-purple-700 shadow-purple-200/50',
  peach: 'bg-orange-500 hover:bg-orange-600 border-orange-700 shadow-orange-200/50',
};