// Lokasi: src/app/(dashboard)/produksi-statistik/line-chart-wrapper.tsx
"use client";

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';

import { formatNumber, formatNumberInThousands } from "@/lib/utils";
import { ChartDataPoint } from "@/lib/types";

// Custom Label Component dengan background
interface CustomLabelProps {
  x?: string | number;
  y?: string | number;
  value?: string | number;
  fill?: string;
}

// Smart Label Component dengan collision detection
interface SmartLabelProps extends CustomLabelProps {
  dataKey?: string;
  data?: ChartDataPoint[];
  index?: number;
}

const SmartLabel = ({ x, y, value, fill, dataKey, data, index }: SmartLabelProps) => {
  const numX = typeof x === 'string' ? parseFloat(x) : x;
  const numY = typeof y === 'string' ? parseFloat(y) : y;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (typeof numX !== 'number' || typeof numY !== 'number' || typeof numValue !== 'number' || isNaN(numX) || isNaN(numY) || isNaN(numValue)) {
    return null;
  }
  
  // Improved collision detection and positioning
  let adjustedY = numY;
  let isBottomPosition = false;
  
  if (data && typeof index === 'number' && dataKey) {
    const currentPoint = data[index];
    if (currentPoint) {
      // Get all year keys (dataKeys)
      const yearKeys = Object.keys(currentPoint).filter(key => key.match(/^\d{4}$/));
      
      if (yearKeys.length > 1) {
        // This is comparison mode, get the other value
        const otherKey = yearKeys.find(key => key !== dataKey);
        if (otherKey) {
          const otherValue = currentPoint[otherKey as keyof ChartDataPoint] as number;
          const valueDiff = Math.abs(numValue - otherValue);
          const maxValue = Math.max(numValue, otherValue);
          const relativeDiff = valueDiff / maxValue;
          
          // If values are close (less than 15% difference), use value-based positioning
          if (relativeDiff < 0.15) {
            if (numValue >= otherValue) {
              // Current value is higher or equal, place label above
              adjustedY = numY - 12;
              isBottomPosition = false;
            } else {
              // Current value is lower, place label below
              adjustedY = numY + 30;
              isBottomPosition = true;
            }
          } else {
            // Values are far apart, use normal positioning based on value
            if (numValue >= otherValue) {
              // Higher value gets top position
              adjustedY = numY - 8;
              isBottomPosition = false;
            } else {
              // Lower value gets bottom position
              adjustedY = numY + 22;
              isBottomPosition = true;
            }
          }
        }
      }
    }
  }
  
  const formattedValue = formatNumber(numValue);
  const textWidth = Math.max(formattedValue.length * 7, 40);
  const padding = 6;
  
  return (
    <g style={{ pointerEvents: 'none' }}>
      <defs>
        <filter id={`labelShadow-${dataKey}-${index}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.15)" />
        </filter>
      </defs>
      <rect
        x={numX - textWidth/2 - padding}
        y={adjustedY - (isBottomPosition ? 5 : 10)}
        width={textWidth + (padding * 2)}
        height={20}
        fill="rgba(255, 255, 255, 0.95)"
        stroke={fill}
        strokeWidth={1}
        rx={4}
        ry={4}
        filter={`url(#labelShadow-${dataKey}-${index})`}
      />
      <text
        x={numX}
        y={adjustedY + (isBottomPosition ? 9 : 4)}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill={fill || "#333"}
        style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.8)' }}
      >
        {formattedValue}
      </text>
    </g>
  );
};

interface LineChartWrapperProps {
  data: ChartDataPoint[];
  dataKey1: string; // Misal: "2024"
  dataKey2?: string; // Misal: "2023"
  onPointClick: (payload: ChartDataPoint) => void;
  showLabels: boolean;
}

const CustomActiveDot = ({ cx, cy, payload, onPointClick }: { cx?: number; cy?: number; payload?: ChartDataPoint; onPointClick: (payload: ChartDataPoint) => void; }) => {
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) {
    return null;
  }
  const hasAnnotations = payload.annotations && payload.annotations.length > 0;
  
  // Dynamic positioning: jika titik terlalu dekat dengan atas chart, letakkan icon di bawah
  const iconSize = 24;
  const iconOffset = 28;
  const minTopDistance = 35; // minimal jarak dari atas chart area
  
  const iconY = cy < minTopDistance ? cy + iconOffset : cy - iconOffset;
  
  return (
    <g onClick={() => onPointClick(payload)} style={{ cursor: 'pointer' }}>
      <circle cx={cx} cy={cy} r={10} fill="#8884d8" fillOpacity={0.2} />
      <circle cx={cx} cy={cy} r={4} fill="#8884d8" />
      {hasAnnotations && (
        <foreignObject x={cx - 12} y={iconY - 12} width={iconSize} height={iconSize} style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-center w-full h-full">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
              {payload.annotations.length}
            </span>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default function LineChartWrapper({ data, dataKey1, dataKey2, onPointClick, showLabels }: LineChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart 
        data={data}
        margin={{ top: 35, right: 20, left: 0, bottom: 35 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis 
          fontSize={12} 
          tickFormatter={(value) => formatNumberInThousands(value)}
          width={45}
        />
        <Tooltip 
            formatter={(value: number) => formatNumber(value)}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend wrapperStyle={{fontSize: "12px"}} />
        <Line 
            type="monotone" 
            dataKey={dataKey1} 
            stroke="#8884d8" 
            strokeWidth={3}
            name={`Tahun ${dataKey1}`} 
            connectNulls 
            dot={false}
            activeDot={(props: unknown) => {
              const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: ChartDataPoint };
              return <CustomActiveDot cx={cx} cy={cy} payload={payload} onPointClick={onPointClick} />;
            }}
        >
          {showLabels && (
            <LabelList 
              dataKey={dataKey1} 
              position="top" 
              offset={15}
              content={(props) => <SmartLabel {...props} fill="#8884d8" dataKey={dataKey1} data={data} />}
            />
          )}
        </Line>
        {dataKey2 && (
            <Line 
                type="monotone" 
                dataKey={dataKey2} 
                stroke="#82ca9d" 
                strokeWidth={3}
                name={`Tahun ${dataKey2}`} 
                connectNulls 
                dot={false}
                activeDot={(props: unknown) => {
                  const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: ChartDataPoint };
                  return <CustomActiveDot cx={cx} cy={cy} payload={payload} onPointClick={onPointClick} />;
                }}
            >
                 {showLabels && (
                   <LabelList 
                     dataKey={dataKey2} 
                     position="bottom" 
                     offset={15}
                     content={(props) => <SmartLabel {...props} fill="#82ca9d" dataKey={dataKey2} data={data} />}
                   />
                 )}
            </Line>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}