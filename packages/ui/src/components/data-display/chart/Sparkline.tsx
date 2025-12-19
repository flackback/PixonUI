import React from 'react';
import { cn } from '../../../utils/cn';

export interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[];
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'white';
  height?: number;
  strokeWidth?: number;
  fill?: boolean;
}

export function Sparkline({
  data,
  color = 'emerald',
  height = 40,
  strokeWidth = 2,
  fill = false,
  className,
  ...props
}: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const colors = {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    white: '#ffffff',
  };

  const strokeColor = colors[color];

  // Generate points
  // We assume width is 100% (viewBox 0 0 100 100) but we need aspect ratio.
  // To make it responsive without JS, we can use preserveAspectRatio="none" on the SVG
  // and map x from 0 to 100.
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    // Invert Y because SVG 0 is top
    // Normalize value between 0 and 100 (height of viewBox)
    // Add some padding (5%) so stroke doesn't clip
    const normalized = ((val - min) / range);
    const y = 95 - (normalized * 90); 
    return { x, y };
  });

  let d = '';
  if (points.length > 0) {
    d = `M ${points[0]!.x} ${points[0]!.y}`;
    // Simple smoothing
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]!;
      const p1 = points[i + 1]!;
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
  }

  const fillPath = fill 
    ? `${d} L 100 100 L 0 100 Z` 
    : undefined;

  return (
    <div 
      className={cn("w-full overflow-hidden", className)} 
      style={{ height }} 
      {...props}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {fill && (
          <path
            d={fillPath}
            fill={strokeColor}
            fillOpacity={0.1}
            stroke="none"
          />
        )}
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke" // Keeps stroke width constant despite scaling
        />
      </svg>
    </div>
  );
}
