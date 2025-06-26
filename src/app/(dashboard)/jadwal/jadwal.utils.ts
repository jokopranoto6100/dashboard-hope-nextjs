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

export const colorVariants: { [key: string]: string } = {
  blue: 'bg-blue-500 hover:bg-blue-600 border-blue-700',
  green: 'bg-green-500 hover:bg-green-600 border-green-700',
  amber: 'bg-amber-500 hover:bg-amber-600 border-amber-700',
  sky: 'bg-sky-500 hover:bg-sky-600 border-sky-700',
  slate: 'bg-slate-400 hover:bg-slate-500 border-slate-600',
};