// src/app/(dashboard)/evaluasi/ubinan/scatter-plot-constants.ts

import { VariableOption } from './types';

export const SCATTER_PLOT_VARIABLES: VariableOption[] = [
  // Hasil Ubinan
  {
    value: 'r701_per_ha',
    label: 'Hasil Ubinan',
    description: 'Hasil ubinan (kuintal/hektar)',
    unit: 'ku/ha'
  },
  {
    value: 'r702',
    label: 'Jumlah Rumpun',
    description: 'Jumlah rumpun per plot',
    unit: 'rumpun/plot'
  },
  
  // Benih dan Input
  {
    value: 'r608_per_ha',
    label: 'Benih yang Digunakan',
    description: 'Jumlah benih per hektar (kg/ha)',
    unit: 'kg/ha'
  },
  
  // Pupuk per Hektar
  {
    value: 'r610_1_per_ha',
    label: 'Pupuk Urea',
    description: 'Pupuk Urea per hektar (kg/ha)',
    unit: 'kg/ha'
  },
  {
    value: 'r610_2_per_ha',
    label: 'Pupuk TSP', 
    description: 'Pupuk TSP per hektar (kg/ha)',
    unit: 'kg/ha'
  },
  {
    value: 'r610_3_per_ha',
    label: 'Pupuk KCL',
    description: 'Pupuk KCL per hektar (kg/ha)',
    unit: 'kg/ha'
  },
  {
    value: 'r610_4_per_ha',
    label: 'Pupuk NPK',
    description: 'Pupuk NPK per hektar (kg/ha)',
    unit: 'kg/ha'
  },
  {
    value: 'r610_5_per_ha',
    label: 'Pupuk Kompos',
    description: 'Pupuk kompos per hektar (kg/ha)',
    unit: 'kg/ha'
  },
  {
    value: 'r610_6_per_ha',
    label: 'Pupuk Organik Cair',
    description: 'Pupuk organik cair per hektar (liter/ha)',
    unit: 'liter/ha'
  },
  {
    value: 'r610_7_per_ha',
    label: 'Pupuk ZA',
    description: 'Pupuk ZA per hektar (kg/ha)',
    unit: 'kg/ha'
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
