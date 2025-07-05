# Fix Flickering Cross-Filter - Dokumentasi

## Masalah: Flickering pada Line Chart saat Cross-Filtering

Saat user mengklik bar chart kabupaten untuk melakukan cross-filtering ke line chart, terjadi **flickering** atau kedipan yang mengganggu user experience.

### Penyebab Utama Flickering:

1. **SWR Key Changes**: Ketika `selectedKabupaten` berubah, SWR key berubah sehingga data di-fetch ulang
2. **Component Re-mounting**: Chart component ter-unmount dan mount ulang 
3. **No Smooth Transition**: Tidak ada transisi yang smooth antara loading states
4. **Multiple Re-renders**: State changes menyebabkan multiple re-renders dalam waktu singkat

## Solusi yang Diterapkan

### 1. **SWR Configuration Optimization**

#### File: `hooks/useStatistikData.ts`

```typescript
// ✅ SETELAH - Optimized SWR config
const { data: lineChartRawData, isLoading: isLineChartLoading } = useSWR(
  lineChartSWRKey,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000,
    keepPreviousData: true,        // 🔥 Keep previous data during loading
    errorRetryCount: 2,
    errorRetryInterval: 1000,
  }
);
```

**Benefit**: `keepPreviousData: true` mencegah chart hilang saat data baru sedang di-fetch.

### 2. **Optimistic Loading UI**

#### File: `components/ChartSection.tsx`

```typescript
// ✅ SEBELUM - Simple skeleton
{isLineChartLoading ? (
  <Skeleton className="w-full h-[300px]" />
) : (
  <LineChartWrapper data={processedData.lineChart} />
)}

// 🔥 SETELAH - Optimistic UI with overlay
{isLineChartLoading ? (
  <div className="relative">
    {/* Show previous chart with reduced opacity */}
    <div className="opacity-50">
      <LineChartWrapper data={processedData.lineChart} />
    </div>
    {/* Loading overlay */}
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Memuat data...</span>
      </div>
    </div>
  </div>
) : (
  <LineChartWrapper data={processedData.lineChart} />
)}
```

**Benefit**: User tetap bisa melihat chart sebelumnya dengan loading indicator yang smooth.

### 3. **React Transition API untuk Optimized State Updates**

#### File: `hooks/useOptimizedCrossFilter.ts`

```typescript
export const useOptimizedCrossFilter = ({ selectedKabupaten, onSetKabupaten, level }) => {
  const [isPending, startTransition] = useTransition();
  const [pendingKabupaten, setPendingKabupaten] = useState(null);

  const handleOptimizedBarClick = useCallback((payload) => {
    if (level === 'kabupaten' && clickedPayload.kode_wilayah !== undefined) {
      const newKabupaten = selectedKabupaten === clickedPayload.kode_wilayah ? null : clickedPayload.kode_wilayah;
      
      // 🔥 Set pending state immediately for UI feedback
      setPendingKabupaten(newKabupaten);
      
      // 🔥 Use transition to mark state update as non-urgent
      startTransition(() => {
        onSetKabupaten(newKabupaten);
        setPendingKabupaten(null);
      });
      
      return true;
    }
    return false;
  }, [level, selectedKabupaten, onSetKabupaten]);

  return {
    handleOptimizedBarClick,
    isPending,
    pendingKabupaten,
    displayKabupaten: pendingKabupaten !== null ? pendingKabupaten : selectedKabupaten
  };
};
```

**Benefit**: 
- `useTransition` membuat state update non-blocking
- `pendingKabupaten` memberikan immediate UI feedback
- `displayKabupaten` untuk consistent UI state

### 4. **Loading Indicators di Header**

#### File: `components/ChartSection.tsx`

```typescript
// 🔥 Loading indicator di title
<CardTitle className="flex items-center gap-2">
  Tren Waktu: {filters.indikatorNama}
  {isLineChartLoading && (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
  )}
</CardTitle>
```

**Benefit**: User mendapat feedback immediate bahwa ada proses loading.

### 5. **Cross-Filter Visual Feedback**

#### File: `components/ChartSection.tsx`

```typescript
// 🔥 Loading overlay pada bar chart saat cross-filtering
<div className="relative">
  <BarChartWrapper data={processedData.barChart} onClick={onBarClick} />
  {selectedKabupaten && isLineChartLoading && (
    <div className="absolute top-2 right-2">
      <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
        <span className="text-xs text-muted-foreground">Filtering...</span>
      </div>
    </div>
  )}
</div>
```

**Benefit**: User tahu bahwa click action mereka sedang diproses.

### 6. **Optimized Handler Composition**

#### File: `statistik-client.tsx`

```typescript
// 🔥 Combined handler yang mengutamakan cross-filtering
const handleCombinedBarClick = useCallback((payload) => {
  const wasHandledByCrossFilter = handleOptimizedBarClick(payload);
  if (!wasHandledByCrossFilter) {
    handleBarClick(payload); // Fallback to annotation
  }
}, [handleOptimizedBarClick, handleBarClick]);

// 🔥 Enhanced ChartSection props
<ChartSection
  selectedKabupaten={displayKabupaten}              // 🔥 Use optimistic kabupaten
  isLineChartLoading={isLineChartLoading || isCrossFilterPending}  // 🔥 Combined loading state
  onBarClick={handleCombinedBarClick}               // 🔥 Use combined handler
  // ... other props
/>
```

**Benefit**: 
- Priority handling untuk cross-filter vs annotation
- Optimistic UI state
- Combined loading indicators

## Hasil Optimisasi

### ✅ **Sebelum Optimisasi:**
- ❌ Chart hilang saat loading (flickering)
- ❌ No visual feedback saat click
- ❌ Blocking state updates
- ❌ Jarring transitions

### ✅ **Setelah Optimisasi:**
- ✅ Chart tetap terlihat dengan overlay loading
- ✅ Immediate visual feedback (spinner, pending state)
- ✅ Non-blocking state updates dengan `useTransition`
- ✅ Smooth transitions dan animations
- ✅ Better UX dengan multiple loading indicators

### 🚀 **Performance Benefits:**

1. **Perceived Performance**: User merasa aplikasi lebih responsif
2. **Visual Continuity**: Tidak ada jarring transitions
3. **Immediate Feedback**: User tahu action mereka diterima
4. **Smooth Loading**: Progressive loading states
5. **Non-blocking UI**: Interface tetap responsif saat data loading

### 📱 **User Experience Improvements:**

1. **Less Jarring**: No more sudden chart disappearance
2. **More Responsive**: Immediate visual feedback
3. **Better Affordances**: Clear loading indicators
4. **Smoother Interactions**: Fluid transitions
5. **Professional Feel**: Production-ready UX

## Best Practices Diterapkan

1. **Progressive Enhancement**: Graceful degradation dengan fallbacks
2. **Optimistic UI**: Immediate feedback, eventual consistency
3. **Smooth Transitions**: No jarring state changes
4. **Loading States**: Multiple levels of loading feedback
5. **Performance Optimization**: Non-blocking updates, data caching

Cross-filtering sekarang memberikan user experience yang **smooth dan professional**! 🚀
