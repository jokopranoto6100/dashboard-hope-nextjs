// src/app/(dashboard)/evaluasi/ubinan/ScatterPlotVariableSelector.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pengaturan Variabel Scatter Plot</CardTitle>
                <p className="text-sm text-muted-foreground mb-4">
          Semua variabel telah distandarisasi dalam satuan per hektar untuk perbandingan yang meaningful, 
          kecuali jumlah rumpun yang tetap dalam satuan per plot untuk menunjukkan kepadatan tanam dalam area sampling.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variable Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="x-variable">Variabel Sumbu X</Label>
            <Select value={xVariable} onValueChange={onXVariableChange}>
              <SelectTrigger id="x-variable">
                <SelectValue placeholder="Pilih variabel X" />
              </SelectTrigger>
              <SelectContent>
                {SCATTER_PLOT_VARIABLES.map((variable) => (
                  <SelectItem key={variable.value} value={variable.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{variable.label}</span>
                      {variable.description && (
                        <span className="text-xs text-gray-500">{variable.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="y-variable">Variabel Sumbu Y</Label>
            <Select value={yVariable} onValueChange={onYVariableChange}>
              <SelectTrigger id="y-variable">
                <SelectValue placeholder="Pilih variabel Y" />
              </SelectTrigger>
              <SelectContent>
                {SCATTER_PLOT_VARIABLES.map((variable) => (
                  <SelectItem key={variable.value} value={variable.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{variable.label}</span>
                      {variable.description && (
                        <span className="text-xs text-gray-500">{variable.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Selection Info */}
        {xVariable && yVariable && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <span className="font-medium text-blue-900">Analisis Saat Ini:</span>
              <div className="mt-1 text-blue-800">
                <span className="font-medium">
                  {SCATTER_PLOT_VARIABLES.find(v => v.value === xVariable)?.label}
                </span>
                <span className="mx-2">vs</span>
                <span className="font-medium">
                  {SCATTER_PLOT_VARIABLES.find(v => v.value === yVariable)?.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
