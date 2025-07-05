// components/MobileView.tsx
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle2, Circle, HardDrive, Tractor, Wheat } from 'lucide-react';
import { SimtpTableRow, SimtpMonthStatus } from '../types';
import { getMonthName, CONSTANTS } from '../utils';

interface MobileViewProps {
  data: SimtpTableRow[];
  selectedYear: number;
}

const MobileCard = React.memo(({ row, selectedYear }: { row: SimtpTableRow; selectedYear: number }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Calculate summary
  const monthlyData = React.useMemo(() => {
    const months = [];
    for (let i = 1; i <= CONSTANTS.MONTHS_IN_YEAR; i++) {
      const status = row[i.toString() as keyof SimtpTableRow] as SimtpMonthStatus | null;
      months.push({
        month: i,
        name: getMonthName(i - 1),
        status,
        hasData: !!status
      });
    }
    return months;
  }, [row]);
  
  const uploadedCount = monthlyData.filter(m => m.hasData).length;
  const annualCount = Object.values(row.annuals).filter(Boolean).length;
  
  return (
    <Card className="mb-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{row.nmkab}</CardTitle>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Bulanan: {uploadedCount}/{CONSTANTS.MONTHS_IN_YEAR}</span>
                  <span>Tahunan: {annualCount}/3</span>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Monthly Data */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Data Bulanan {selectedYear}</h4>
              <div className="grid grid-cols-3 gap-2">
                {monthlyData.map(month => (
                  <div key={month.month} className="flex items-center gap-2 p-2 rounded-md border text-sm">
                    {month.hasData ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-2 w-2 text-gray-300 flex-shrink-0 ml-1" />
                    )}
                    <span className="truncate">{month.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Annual Data */}
            <div>
              <h4 className="font-medium mb-2">Data Tahunan {selectedYear - 1}</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-md border text-sm">
                  <HardDrive className={`h-4 w-4 flex-shrink-0 ${row.annuals.LAHAN_TAHUNAN ? 'text-green-600' : 'text-gray-300'}`} />
                  <span>Lahan</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border text-sm">
                  <Tractor className={`h-4 w-4 flex-shrink-0 ${row.annuals.ALSIN_TAHUNAN ? 'text-green-600' : 'text-gray-300'}`} />
                  <span>Alsin</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border text-sm">
                  <Wheat className={`h-4 w-4 flex-shrink-0 ${row.annuals.BENIH_TAHUNAN ? 'text-green-600' : 'text-gray-300'}`} />
                  <span>Benih</span>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
});

MobileCard.displayName = 'MobileCard';

export const MobileView = React.memo(({ data, selectedYear }: MobileViewProps) => {
  return (
    <div className="space-y-0">
      {data.map(row => (
        <MobileCard key={row.kab_kode} row={row} selectedYear={selectedYear} />
      ))}
    </div>
  );
});

MobileView.displayName = 'MobileView';
