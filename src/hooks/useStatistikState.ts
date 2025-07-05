// src/hooks/useStatistikState.ts
import { useReducer, useCallback } from 'react';
import { ChartDataPoint } from '@/lib/types';

type FilterState = {
  bulan: string;
  indikatorNama: string;
  idIndikator: number | null;
  level: 'provinsi' | 'kabupaten';
  tahunPembanding: string;
};

type TimeDataView = 'bulanan' | 'subround';

interface StatistikState {
  filters: FilterState;
  selectedKabupaten: string | null;
  isAnnotationSheetOpen: boolean;
  selectedAnnotationPoint: ChartDataPoint | null;
  showLineChartLabels: boolean;
  timeDataView: TimeDataView;
}

type StatistikAction =
  | { type: 'SET_FILTER'; key: keyof Omit<FilterState, 'idIndikator'>; value: string }
  | { type: 'SET_INDICATOR'; nama: string; id: number | null }
  | { type: 'SET_KABUPATEN'; value: string | null }
  | { type: 'TOGGLE_ANNOTATION_SHEET'; point?: ChartDataPoint | null }
  | { type: 'TOGGLE_LINE_CHART_LABELS' }
  | { type: 'SET_TIME_DATA_VIEW'; value: TimeDataView }
  | { type: 'RESET_SELECTIONS' };

const initialState = (availableIndicators: { id: number; nama_resmi: string }[]): StatistikState => ({
  filters: {
    bulan: 'tahunan',
    indikatorNama: availableIndicators[0]?.nama_resmi || '',
    idIndikator: availableIndicators[0]?.id || null,
    level: 'kabupaten',
    tahunPembanding: 'tidak',
  },
  selectedKabupaten: null,
  isAnnotationSheetOpen: false,
  selectedAnnotationPoint: null,
  showLineChartLabels: false,
  timeDataView: 'bulanan',
});

const statistikReducer = (state: StatistikState, action: StatistikAction): StatistikState => {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.key]: action.value,
        },
        selectedKabupaten: null,
        timeDataView: 'bulanan',
      };
    
    case 'SET_INDICATOR':
      return {
        ...state,
        filters: {
          ...state.filters,
          indikatorNama: action.nama,
          idIndikator: action.id,
        },
        selectedKabupaten: null,
        timeDataView: 'bulanan',
      };
    
    case 'SET_KABUPATEN':
      return {
        ...state,
        selectedKabupaten: action.value,
      };
    
    case 'TOGGLE_ANNOTATION_SHEET':
      return {
        ...state,
        isAnnotationSheetOpen: !state.isAnnotationSheetOpen,
        selectedAnnotationPoint: action.point || null,
      };
    
    case 'TOGGLE_LINE_CHART_LABELS':
      return {
        ...state,
        showLineChartLabels: !state.showLineChartLabels,
      };
    
    case 'SET_TIME_DATA_VIEW':
      return {
        ...state,
        timeDataView: action.value,
      };
    
    case 'RESET_SELECTIONS':
      return {
        ...state,
        selectedKabupaten: null,
        timeDataView: 'bulanan',
      };
    
    default:
      return state;
  }
};

export const useStatistikState = (availableIndicators: { id: number; nama_resmi: string }[]) => {
  const [state, dispatch] = useReducer(statistikReducer, initialState(availableIndicators));

  const setFilter = useCallback((key: keyof Omit<FilterState, 'idIndikator'>, value: string) => {
    dispatch({ type: 'SET_FILTER', key, value });
  }, []);

  const setIndicator = useCallback((nama: string, id: number | null) => {
    dispatch({ type: 'SET_INDICATOR', nama, id });
  }, []);

  const setKabupaten = useCallback((value: string | null) => {
    dispatch({ type: 'SET_KABUPATEN', value });
  }, []);

  const toggleAnnotationSheet = useCallback((point?: ChartDataPoint | null) => {
    dispatch({ type: 'TOGGLE_ANNOTATION_SHEET', point });
  }, []);

  const toggleLineChartLabels = useCallback(() => {
    dispatch({ type: 'TOGGLE_LINE_CHART_LABELS' });
  }, []);

  const setTimeDataView = useCallback((value: TimeDataView) => {
    dispatch({ type: 'SET_TIME_DATA_VIEW', value });
  }, []);

  const resetSelections = useCallback(() => {
    dispatch({ type: 'RESET_SELECTIONS' });
  }, []);

  return {
    state,
    actions: {
      setFilter,
      setIndicator,
      setKabupaten,
      toggleAnnotationSheet,
      toggleLineChartLabels,
      setTimeDataView,
      resetSelections,
    },
  };
};
