import React from 'react';
import { useChart, normalize, ChartDataPoint } from './Chart';
import { cn } from '../../../utils/cn';

export interface AreaChartProps<T = any> {
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  showValues?: boolean;
  animationDelay?: number;
  onValueClick?: (data: ChartDataPoint<T>) => void;
}

export function AreaChart<T = any>({ 
  color = 'purple', 
  showValues = false, 
  animationDelay = 0,
  onValueClick 
}: AreaChartProps<T>) {
  const { width, height, padding, data, maxValue, setHoveredIndex, hoveredIndex } = useChart<T>();
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const itemWidth = chartWidth / (data.length - 1); // Points are on edges

  const colors = {
    cyan: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.2)' },
    purple: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
    emerald: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' },
    amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' },
    rose: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.2)' },
  };

  const theme = colors[color];

  // Generate Path Data
  const points = data.map((point, i) => {
    const x = padding.left + itemWidth * i;
    const y = height - padding.bottom - normalize(point.value, maxValue, chartHeight);
    return { x, y, item: point };
  });

  // Simple Line Path
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  // Area Path (closes the loop)
  const areaPath = `
    ${linePath}
    L ${width - padding.right} ${height - padding.bottom}
    L ${padding.left} ${height - padding.bottom}
    Z
  `;

  return (
    <g>
      {/* Area Fill */}
      <path
        d={areaPath}
        fill={theme.fill}
        style={{ 
            opacity: 0,
            animation: `fade-in 1s ease-out ${animationDelay}s forwards` 
        }}
      />

      {/* Stroke Line */}
      <path
        d={linePath}
        fill="none"
        stroke={theme.stroke}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-line"
        style={{
            strokeDasharray: 2000,
            strokeDashoffset: 2000,
            animation: `draw-line 2s ease-out ${animationDelay}s forwards`
        }}
      />

      {/* Interactive Points */}
      {points.map((p, i) => (
        <g 
            key={i} 
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onValueClick?.(p.item)}
            className={cn("cursor-crosshair", onValueClick && "cursor-pointer")}
        >
            {/* Invisible Hit Area */}
            <rect 
                x={p.x - itemWidth / 2} 
                y={padding.top} 
                width={itemWidth} 
                height={chartHeight} 
                fill="transparent" 
            />
            
            {/* Active Point Indicator */}
            {(hoveredIndex === i || showValues) && (
                <>
                    {hoveredIndex === i && (
                      <line
                          x1={p.x}
                          y1={padding.top}
                          x2={p.x}
                          y2={height - padding.bottom}
                          stroke="white"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          className="opacity-50"
                      />
                    )}
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === i ? 6 : 4}
                        fill={theme.stroke}
                        stroke="white"
                        strokeWidth={2}
                        style={{
                            transition: 'r 0.2s ease-out'
                        }}
                    />
                    {showValues && (
                      <text
                          x={p.x}
                          y={p.y - 12}
                          textAnchor="middle"
                          fill="white"
                          fontSize={12}
                          fontWeight={500}
                          style={{ 
                              opacity: 0,
                              animation: `fade-in-up 0.5s ease-out ${animationDelay + 1 + i * 0.1}s forwards`,
                              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}
                      >
                          {data[i]?.value}
                      </text>
                    )}
                </>
            )}
        </g>
      ))}

      <style>{`
        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </g>
  );
}
