import React from 'react';
import { useChart } from './Chart';

export interface YAxisProps {
  ticks?: number;
  format?: (value: number) => string;
}

export function ChartYAxis({ ticks = 5, format = (v) => v.toString() }: YAxisProps) {
  const { height, padding, maxValue } = useChart();
  const chartHeight = height - padding.top - padding.bottom;

  return (
    <g>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const value = (maxValue / ticks) * i;
        const y = height - padding.bottom - (chartHeight / ticks) * i;
        
        return (
          <text
            key={i}
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-400 dark:fill-white/40 text-xs font-medium"
          >
            {format(Math.round(value))}
          </text>
        );
      })}
    </g>
  );
}
