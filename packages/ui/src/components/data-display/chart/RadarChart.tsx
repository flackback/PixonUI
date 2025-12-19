import React, { useMemo, useState } from 'react';
import { cn } from '../../../utils/cn';

export interface RadarDataPoint {
  subject: string;
  [key: string]: any;
}

export interface RadarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: RadarDataPoint[];
  keys: string[]; // Keys to plot (e.g. ['A', 'B'])
  colors?: string[]; // Colors for each key
  maxValue?: number;
  height?: number;
}

export function RadarChart({
  data,
  keys,
  colors = ['cyan', 'purple', 'emerald'],
  maxValue: userMaxValue,
  height = 300,
  className,
  ...props
}: RadarChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Responsive width
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const center = { x: containerWidth / 2, y: height / 2 };
  const radius = Math.min(containerWidth, height) / 2 - 40; // 40px padding

  const maxValue = useMemo(() => {
    if (userMaxValue) return userMaxValue;
    let max = 0;
    data.forEach(d => {
      keys.forEach(k => {
        if (d[k] > max) max = d[k];
      });
    });
    return max * 1.1;
  }, [data, keys, userMaxValue]);

  const angleSlice = (Math.PI * 2) / data.length;

  const colorMap: Record<string, string> = {
    cyan: 'rgba(6, 182, 212, 0.5)',
    purple: 'rgba(139, 92, 246, 0.5)',
    emerald: 'rgba(16, 185, 129, 0.5)',
    amber: 'rgba(245, 158, 11, 0.5)',
    rose: 'rgba(244, 63, 94, 0.5)',
  };
  
  const strokeMap: Record<string, string> = {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  };

  if (containerWidth === 0) return <div ref={containerRef} style={{ height }} />;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full select-none", className)}
      style={{ height }}
      {...props}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${containerWidth} ${height}`} className="overflow-visible">
        {/* Grid */}
        {[1, 2, 3, 4, 5].map((level) => {
          const levelRadius = (radius / 5) * level;
          const points = data.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            return `${center.x + Math.cos(angle) * levelRadius},${center.y + Math.sin(angle) * levelRadius}`;
          }).join(' ');
          
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes & Labels */}
        {data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x = center.x + Math.cos(angle) * radius;
          const y = center.y + Math.sin(angle) * radius;
          
          // Label position (slightly outside)
          const labelX = center.x + Math.cos(angle) * (radius + 20);
          const labelY = center.y + Math.sin(angle) * (radius + 20);

          return (
            <g key={i}>
              <line
                x1={center.x}
                y1={center.y}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize="12"
              >
                {d.subject}
              </text>
            </g>
          );
        })}

        {/* Data Polygons */}
        {keys.map((key, kIndex) => {
          const points = data.map((d, i) => {
            const value = d[key] || 0;
            const r = (value / maxValue) * radius;
            const angle = angleSlice * i - Math.PI / 2;
            return `${center.x + Math.cos(angle) * r},${center.y + Math.sin(angle) * r}`;
          }).join(' ');

          const colorName = colors[kIndex % colors.length] || 'cyan';
          const fill = colorMap[colorName];
          const stroke = strokeMap[colorName];

          return (
            <polygon
              key={key}
              points={points}
              fill={fill}
              fillOpacity={0.3}
              stroke={stroke}
              strokeWidth={2}
              className="transition-all duration-500 ease-out hover:fill-opacity-50"
            />
          );
        })}
      </svg>
    </div>
  );
}
