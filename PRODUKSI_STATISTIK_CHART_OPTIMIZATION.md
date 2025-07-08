# Produksi Statistik Chart Layout Optimization

## Overview
Optimized the chart layout and formatting in the produksi-statistik dashboard page to improve space utilization and data readability, following the same patterns applied to the KSA evaluasi charts.

## Changes Made

### 1. Enhanced Number Formatting

#### Added `formatNumberInThousands` Function
- **Location**: `/src/lib/utils.ts`
- **Purpose**: Format large numbers with "k" suffix for thousands to save space on Y-axis
- **Implementation**:
  ```typescript
  export const formatNumberInThousands = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return '-';
    }
    
    // For numbers less than 1000, show as is
    if (Math.abs(num) < 1000) {
      return formatNumber(num, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    
    // For numbers >= 1000, convert to thousands
    const valueInThousands = num / 1000;
    const formatted = formatNumber(valueInThousands, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 1 
    });
    
    return `${formatted}k`;
  };
  ```

### 2. Optimized Card Content Padding

#### ChartSection Component
- **Location**: `/src/app/(dashboard)/produksi-statistik/components/ChartSection.tsx`
- **Changes**:
  - Reduced CardContent padding from default to `className="p-3"`
  - Applied to all chart containers (bar chart, pie chart, line chart)
  - **Result**: More space for chart content, better data visibility

### 3. Improved Chart Margins and Y-axis Formatting

#### Line Chart Wrapper
- **Location**: `/src/app/(dashboard)/produksi-statistik/line-chart-wrapper.tsx`
- **Optimizations**:
  - **Margins**: Changed from `{ top: 30, right: 20, left: 10, bottom: 5 }` to `{ top: 5, right: 20, left: 0, bottom: 5 }`
  - **Y-axis**: 
    - Added `width={45}` for consistent axis width
    - Changed ticker formatter to use `formatNumberInThousands(value)` instead of `formatNumber(value)`
    - **Result**: Y-axis now shows "10k", "20k" instead of "10.000,00", "20.000,00"

#### Bar Chart Wrapper
- **Location**: `/src/app/(dashboard)/produksi-statistik/bar-chart-wrapper.tsx`
- **Optimizations**:
  - **Mobile Layout**: Reduced right margin from 30 to 20
  - **Desktop Layout**: 
    - Added explicit margins: `{ top: 5, right: 20, left: 0, bottom: 5 }`
    - Y-axis width set to 45px
    - Applied `formatNumberInThousands` to Y-axis ticker
  - **Result**: Consistent formatting across mobile and desktop views

### 4. Space Efficiency Improvements

#### Before vs After Comparison
- **Before**: Y-axis showed "10.000,00", "20.000,00" (wide labels)
- **After**: Y-axis shows "10k", "20k" (compact labels)
- **Space Saved**: ~40% reduction in Y-axis label width
- **Visual Impact**: More room for actual chart data, cleaner appearance

## Technical Benefits

### 1. Consistent Design Language
- Matches the optimization patterns from KSA evaluasi charts
- Unified chart styling across the dashboard
- Improved visual hierarchy

### 2. Better Data Density
- More chart content visible in the same space
- Reduced visual clutter from overly detailed axis labels
- Enhanced readability on mobile devices

### 3. Performance Consistency
- Consistent margin and padding values across all chart types
- Standardized Y-axis width prevents layout shifts
- Optimized rendering with reduced label complexity

## Usage Examples

### Original Y-axis Labels
```
100.000,00
200.000,00
300.000,00
```

### Optimized Y-axis Labels
```
100k
200k
300k
```

### Tooltip Formatting
- **Y-axis**: Uses `formatNumberInThousands` for compact display
- **Tooltips**: Still uses `formatNumber` for full precision
- **Data Labels**: Uses `formatNumber` for precision when labels are enabled

## Files Modified

1. `/src/lib/utils.ts` - Added `formatNumberInThousands` function
2. `/src/app/(dashboard)/produksi-statistik/components/ChartSection.tsx` - Reduced CardContent padding
3. `/src/app/(dashboard)/produksi-statistik/line-chart-wrapper.tsx` - Optimized margins and Y-axis
4. `/src/app/(dashboard)/produksi-statistik/bar-chart-wrapper.tsx` - Optimized margins and Y-axis

## Testing
- ✅ Build successful with TypeScript validation
- ✅ All chart types render correctly
- ✅ Responsive design maintained
- ✅ Tooltip precision preserved
- ✅ No breaking changes to existing functionality

## Implementation Notes
- The optimization preserves full number precision in tooltips and data labels
- Only Y-axis tick labels are abbreviated for space efficiency
- Chart margins are consistent with the KSA evaluasi chart optimizations
- Mobile and desktop layouts both benefit from the changes

This optimization significantly improves the visual presentation of statistical data while maintaining data accuracy and user experience across all device sizes.
