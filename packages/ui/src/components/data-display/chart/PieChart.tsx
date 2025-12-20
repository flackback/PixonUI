import React, { useMemo } from 'react';
import type { ChartDataPoint } from './Chart';
import { useChart } from './Chart';
import { cn } from '../../../utils/cn';

export interface PieChartProps<T = any> {
  innerRadius?: number; // 0 for Pie, >0 for Donut (0-1 relative to radius, or absolute pixels?) Let's say 0-1 relative.
  padAngle?: number;
  showLabels?: boolean;
  colors?: string[];
  onValueClick?: (data: ChartDataPoint<T>) => void;
}

export function PieChart<T = any>({ 
  innerRadius = 0, 
  padAngle = 0.02, 
  showLabels = false,
  colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'],
  onValueClick
}: PieChartProps<T>) {
  const { width, height, data, setHoveredIndex, hoveredIndex } = useChart<T>();
  
  const radius = Math.min(width, height) / 2 * 0.8; // 80% of half-size to leave room for labels/hover
  const centerX = width / 2;
  const centerY = height / 2;
  
  const total = useMemo(() => data.reduce((acc, cur) => acc + cur.value, 0), [data]);
  
  let currentAngle = 0;
  
  const slices = data.map((point, i) => {
    const percentage = point.value / total;
    const angle = percentage * 2 * Math.PI;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    currentAngle += angle;
    
    return {
      ...point,
      startAngle,
      endAngle,
      color: colors[i % colors.length],
      percentage
    };
  });

  // Helper to get coordinates
  const getCoordinatesForPercent = (percent: number, r: number) => {
    const x = centerX + r * Math.cos(percent);
    const y = centerY + r * Math.sin(percent);
    return [x, y];
  };

  return (
    <g>
      {slices.map((slice, i) => {
        // Calculate path
        // We need to handle the gap (padAngle) if multiple slices
        const effectiveStartAngle = slice.startAngle + (slices.length > 1 ? padAngle / 2 : 0);
        const effectiveEndAngle = slice.endAngle - (slices.length > 1 ? padAngle / 2 : 0);
        
        // If the slice is too small due to padding, just skip or render a line? 
        // For simplicity, let's just clamp.
        if (effectiveEndAngle <= effectiveStartAngle) return null;

        const [startX, startY] = getCoordinatesForPercent(effectiveStartAngle, radius);
        const [endX, endY] = getCoordinatesForPercent(effectiveEndAngle, radius);
        
        const largeArcFlag = effectiveEndAngle - effectiveStartAngle > Math.PI ? 1 : 0;
        
        // Inner radius (for donut)
        const rInner = radius * innerRadius;
        const [innerStartX, innerStartY] = getCoordinatesForPercent(effectiveEndAngle, rInner);
        const [innerEndX, innerEndY] = getCoordinatesForPercent(effectiveStartAngle, rInner);

        const pathData = [
          `M ${startX} ${startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          innerRadius > 0 ? `L ${innerStartX} ${innerStartY}` : `L ${centerX} ${centerY}`,
          innerRadius > 0 ? `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY}` : '',
          'Z'
        ].join(' ');

        const isHovered = hoveredIndex === i;
        
        // Label position (centroid)
        const midAngle = (slice.startAngle + slice.endAngle) / 2;
        const labelRadius = radius * (innerRadius > 0 ? (1 + innerRadius) / 2 : 0.7);
        const [labelX, labelY] = getCoordinatesForPercent(midAngle, labelRadius);

        return (
          <g 
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          >
            <path
              d={pathData}
              fill={slice.color}
              className={cn(
                "transition-all duration-300 ease-out",
                isHovered ? "opacity-100 brightness-110" : "opacity-90"
              )}
              style={{
                transformOrigin: `${centerX}px ${centerY}px`,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                animation: `pie-enter 0.6s ease-out ${i * 0.05}s backwards`
              }}
            />
            
            {(showLabels || isHovered) && (
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={12}
                fontWeight={600}
                className="pointer-events-none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {Math.round(slice.percentage * 100)}%
              </text>
            )}
          </g>
        );
      })}
      <style>{`
        @keyframes pie-enter {
          from { opacity: 0; transform: scale(0.8) rotate(-10deg); }
          to { opacity: 0.9; transform: scale(1) rotate(0); }
        }
      `}</style>
    </g>
  );
}
