import { LucideIcon, CheckCircle, XCircle, Clock, Info } from 'lucide-react';

// Helper function to get visual properties based on status name
export const getStatusVisuals = (statusName: string): { Icon: LucideIcon; variant: 'success' | 'destructive' | 'warning' | 'secondary' } => {
  const lowerCaseStatus = statusName.toLowerCase();

  if (lowerCaseStatus.includes('selesai') || lowerCaseStatus.includes('approved') || lowerCaseStatus.includes('panen') || lowerCaseStatus.includes('clean')) {
    return { Icon: CheckCircle, variant: 'success' as const };
  }
  if (lowerCaseStatus.includes('inkonsisten') || lowerCaseStatus.includes('error') || lowerCaseStatus.includes('rejected') || lowerCaseStatus.includes('lewat panen')) {
    return { Icon: XCircle, variant: 'destructive' as const };
  }
  if (lowerCaseStatus.includes('submitted') || lowerCaseStatus.includes('belum') || lowerCaseStatus.includes('warning')) {
    return { Icon: Clock, variant: 'warning' as const };
  }
  
  // Default/fallback for other statuses
  return { Icon: Info, variant: 'secondary' as const };
};