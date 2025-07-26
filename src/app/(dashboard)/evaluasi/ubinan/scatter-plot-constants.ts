// src/app/(dashboard)/evaluasi/ubinan/scatter-plot-constants.ts

import { VariableOption } from './types';

export const SCATTER_PLOT_VARIABLES: VariableOption[] = [
  // Hasil Ubinan
  {
    value: 'r701',
    label: 'Hasil Ubinan (R701)',
    description: 'Hasil ubinan dalam kuintal per hektar',
    unit: 'kuintal/ha'
  },
  {
    value: 'r702',
    label: 'Jumlah Rumpun (R702)',
    description: 'Jumlah rumpun yang dipanen',
    unit: 'rumpun'
  },
  
  // Luas dan Benih
  {
    value: 'r604',
    label: 'Luas Ubinan (R604)',
    description: 'Luas ubinan dalam meter persegi',
    unit: 'm²'
  },
  {
    value: 'r608',
    label: 'Benih yang Digunakan (R608)',
    description: 'Jumlah benih yang digunakan',
    unit: 'kg'
  },
  
  // Pupuk
  {
    value: 'r610_1',
    label: 'Pupuk Urea (R610_1)',
    description: 'Jumlah pupuk Urea yang digunakan',
    unit: 'kg'
  },
  {
    value: 'r610_2',
    label: 'Pupuk TSP (R610_2)', 
    description: 'Jumlah pupuk TSP yang digunakan',
    unit: 'kg'
  },
  {
    value: 'r610_3',
    label: 'Pupuk KCL (R610_3)',
    description: 'Jumlah pupuk KCL yang digunakan',
    unit: 'kg'
  },
  {
    value: 'r610_4',
    label: 'Pupuk NPK (R610_4)',
    description: 'Jumlah pupuk NPK yang digunakan',
    unit: 'kg'
  },
  {
    value: 'r610_5',
    label: 'Pupuk Kompos (R610_5)',
    description: 'Jumlah pupuk kompos yang digunakan',
    unit: 'kg'
  },
  {
    value: 'r610_6',
    label: 'Pupuk Organik Cair (R610_6)',
    description: 'Jumlah pupuk organik cair yang digunakan',
    unit: 'liter'
  },
  {
    value: 'r610_7',
    label: 'Pupuk ZA (R610_7)',
    description: 'Jumlah pupuk ZA yang digunakan',
    unit: 'kg'
  },
];

export const POPULAR_COMBINATIONS = [
  {
    xVariable: 'r702',
    yVariable: 'r701',
    title: 'Hubungan Jumlah Rumpun dengan Hasil Ubinan',
    description: 'Analisis korelasi antara jumlah rumpun yang dipanen dengan produktivitas'
  },
  {
    xVariable: 'r608',
    yVariable: 'r701',
    title: 'Hubungan Penggunaan Benih dengan Hasil Ubinan',
    description: 'Analisis efektivitas penggunaan benih terhadap produktivitas'
  },
  {
    xVariable: 'r610_1',
    yVariable: 'r701',
    title: 'Hubungan Pupuk Urea dengan Hasil Ubinan',
    description: 'Analisis dampak penggunaan pupuk Urea terhadap produktivitas'
  },
  {
    xVariable: 'r610_4',
    yVariable: 'r701',
    title: 'Hubungan Pupuk NPK dengan Hasil Ubinan',
    description: 'Analisis dampak penggunaan pupuk NPK terhadap produktivitas'
  },
  {
    xVariable: 'r604',
    yVariable: 'r701',
    title: 'Hubungan Luas Ubinan dengan Hasil',
    description: 'Analisis konsistensi hasil per satuan luas'
  },
];

export const getVariableLabel = (variableValue: string): string => {
  const variable = SCATTER_PLOT_VARIABLES.find(v => v.value === variableValue);
  return variable ? variable.label : variableValue;
};

export const getVariableUnit = (variableValue: string): string => {
  const variable = SCATTER_PLOT_VARIABLES.find(v => v.value === variableValue);
  return variable?.unit || '';
};

export const generateScatterPlotTitle = (xVariable: string, yVariable: string): string => {
  const xLabel = getVariableLabel(xVariable);
  const yLabel = getVariableLabel(yVariable);
  return `Hubungan ${xLabel} dengan ${yLabel}`;
};
