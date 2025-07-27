// src/app/(dashboard)/evaluasi/ubinan/ScatterPlotVariableSelector.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { SCATTER_PLOT_VARIABLES } from './scatter-plot-constants';

interface ScatterPlotVariableSelectorProps {
  xVariable: string;
  yVariable: string;
  onXVariableChange: (value: string) => void;
  onYVariableChange: (value: string) => void;
}

export function ScatterPlotVariableSelector({
  xVariable,
  yVariable,
  onXVariableChange,
  onYVariableChange
}: ScatterPlotVariableSelectorProps) {
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          Konfigurasi Variabel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact Variable Selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="x-variable" className="text-sm font-medium">Sumbu X</Label>
            <Select value={xVariable} onValueChange={onXVariableChange}>
              <SelectTrigger id="x-variable" className="h-10">
                <SelectValue placeholder="Pilih variabel X" />
              </SelectTrigger>
              <SelectContent>
                {SCATTER_PLOT_VARIABLES.map((variable) => (
                  <SelectItem key={variable.value} value={variable.value}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{variable.label}</span>
                      <span className="text-xs text-gray-500 ml-2">{variable.unit}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="y-variable" className="text-sm font-medium">Sumbu Y</Label>
            <Select value={yVariable} onValueChange={onYVariableChange}>
              <SelectTrigger id="y-variable" className="h-10">
                <SelectValue placeholder="Pilih variabel Y" />
              </SelectTrigger>
              <SelectContent>
                {SCATTER_PLOT_VARIABLES.map((variable) => (
                  <SelectItem key={variable.value} value={variable.value}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{variable.label}</span>
                      <span className="text-xs text-gray-500 ml-2">{variable.unit}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compact Current Selection Info */}
        {xVariable && yVariable && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded">
              <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <span className="font-medium">
                {SCATTER_PLOT_VARIABLES.find(v => v.value === xVariable)?.label}
              </span>
              <span className="mx-2 text-blue-600 dark:text-blue-400">×</span>
              <span className="font-medium">
                {SCATTER_PLOT_VARIABLES.find(v => v.value === yVariable)?.label}
              </span>
            </div>
          </div>
        )}
        
        {/* Compact info text */}
        <p className="text-xs text-muted-foreground">
          Variabel distandarisasi per hektar kecuali jumlah rumpun (per plot).
        </p>
      </CardContent>
    </Card>
  );
}
