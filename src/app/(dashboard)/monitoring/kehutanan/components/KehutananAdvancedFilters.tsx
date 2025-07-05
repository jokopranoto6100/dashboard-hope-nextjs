// components/KehutananAdvancedFilters.tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import { ALL_STATUSES } from '../kehutanan.types';

interface FilterState {
  search: string;
  kabupaten: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  kabupatenOptions: string[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const KehutananAdvancedFilters = React.memo(({ 
  filters, 
  onFiltersChange, 
  kabupatenOptions,
  isExpanded,
  onToggleExpanded 
}: AdvancedFiltersProps) => {
  const hasActiveFilters = filters.search || filters.kabupaten || filters.status || filters.dateFrom || filters.dateTo;
  
  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      kabupaten: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const removeFilter = (filterKey: string) => {
    onFiltersChange({
      ...filters,
      [filterKey]: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic Search Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Cari nama perusahaan..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full md:w-[300px]"
          />
        </div>
        <Select
          value={filters.kabupaten}
          onValueChange={(value) => onFiltersChange({ ...filters, kabupaten: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[200px]">
            <SelectValue placeholder="Filter Kabupaten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kabupaten</SelectItem>
            {kabupatenOptions.map(kab => (
              <SelectItem key={kab} value={kab}>{kab}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleExpanded}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {isExpanded ? 'Sembunyikan' : 'Filter Lanjutan'}
        </Button>
      </div>

      {/* Advanced Filters (Collapsible) */}
      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter Lanjutan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {ALL_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Dari Tanggal</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sampai Tanggal</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Semua Filter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Filter aktif:</span>
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Pencarian: "{filters.search}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('search')} />
            </Badge>
          )}
          {filters.kabupaten && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Kabupaten: {filters.kabupaten}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('kabupaten')} />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('status')} />
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Dari: {filters.dateFrom}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('dateFrom')} />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sampai: {filters.dateTo}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('dateTo')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});

KehutananAdvancedFilters.displayName = 'KehutananAdvancedFilters';
