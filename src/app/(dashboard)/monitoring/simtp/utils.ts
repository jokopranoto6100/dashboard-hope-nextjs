// utils.ts - Utility functions for SIMTP monitoring
// SIMTP has a unique reporting period: data for previous month is collected in current month
// Example: July 1-20 period is for collecting June data

export const CONSTANTS = {
  MONTHS_IN_YEAR: 12,
  LOADING_SKELETON_ROWS: 14,
  TOOLTIP_DELAY: 100,
} as const;

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
] as const;

/**
 * Get Indonesian month name
 */
export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex] || 'Invalid';
}

/**
 * Check if a month is the current ongoing reporting period
 * For SIMTP, the reporting period for previous month data happens in current month
 * Example: July 1-20 is for collecting June data
 */
export function isOngoingReportingPeriod(
  selectedYear: number, 
  month: number, 
  currentYear: number, 
  currentMonth: number
): boolean {
  // For SIMTP, we report previous month's data in current month
  // So if current month is July (7), the ongoing period is for June (6) data
  const reportingMonth = currentMonth === 1 ? 12 : currentMonth - 1; // Handle January edge case
  const reportingYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  return selectedYear === reportingYear && month === reportingMonth;
}

/**
 * Format upload date for Indonesian locale with WIB timezone
 */
export function formatUploadDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Format tanggal secara terpisah
  const dateFormatted = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long', 
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
  
  // Format waktu secara terpisah
  const timeFormatted = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
  
  // Gabungkan dengan format yang diinginkan
  return `${dateFormatted} pukul ${timeFormatted} WIB`;
}

/**
 * Get accessibility label for status
 */
export function getStatusAriaLabel(
  monthName: string, 
  hasData: boolean, 
  isOngoing: boolean
): string {
  if (hasData) return `Status ${monthName}: Sudah diupload`;
  if (isOngoing) return `Status ${monthName}: Periode pelaporan sedang berjalan`;
  return `Status ${monthName}: Belum diupload`;
}
