import React from 'react';
import type { ChartDataPoint } from './Chart';
import { useChart, normalize } from './Chart';
import { cn } from '../../../utils/cn';

export interface LineChartProps<T = any> {
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  showValues?: boolean;
  animationDelay?: number;
  curve?: 'linear' | 'smooth' | 'step';
  strokeWidth?: number;
  align?: 'center' | 'edge';
  onValueClick?: (data: ChartDataPoint<T>) => void;
}

export function LineChart<T = any>({ 
  color = 'cyan', 
  showValues = false, 
  animationDelay = 0,
  curve = 'smooth',
  strokeWidth = 3,
  align = 'edge',
  onValueClick 
}: LineChartProps<T>) {
  const { width, height, padding, data, maxValue, setHoveredIndex, hoveredIndex } = useChart<T>();

  if (!data || data.length === 0) return null;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Align 'center' matches BarChart (bands), 'edge' matches AreaChart (points)
  const itemWidth = align === 'center' 
    ? chartWidth / data.length 
    : (data.length > 1 ? chartWidth / (data.length - 1) : chartWidth);

  const colors = {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  };

  const strokeColor = colors[color] || colors.cyan;

  // Generate Points
  const points = data.map((point, i) => {
    let x;
    if (align === 'center') {
      // Center of the band
      x = padding.left + itemWidth * i + itemWidth / 2;
    } else {
      // Edge
      x = padding.left + itemWidth * i;
    }
    
    const y = height - padding.bottom - normalize(point.value, maxValue, chartHeight);
    return { x, y, item: point };
  });

  // Generate Path Command
  let d = '';
  if (points.length > 0) {
    d = `M ${points[0]!.x} ${points[0]!.y}`;
    
    if (curve === 'smooth' && points.length > 1) {
      // Cubic Bezier interpolation between points
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i]!;
        const p1 = points[i + 1]!;
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
    } else if (curve === 'step' && points.length > 1) {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i]!;
        const p1 = points[i + 1]!;
        d += ` L ${p1.x} ${p0.y} L ${p1.x} ${p1.y}`;
      }
    } else {
      // Linear
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i]!.x} ${points[i]!.y}`;
      }
    }
  }

  return (
    <g>
      <defs>
        {/* Glow Vector Filter */}
        <filter id={`line-glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow Line Underlay */}
      {d && (
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 3}
          opacity={0.15}
          filter={`url(#line-glow-${color})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
              strokeDasharray: 3000,
              strokeDashoffset: 3000,
              animation: `draw-line 2.5s cubic-bezier(0.22, 1, 0.36, 1) ${animationDelay}s forwards`
          }}
        />
      )}

      {/* Primary Line */}
      {d && (
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
              strokeDasharray: 3000,
              strokeDashoffset: 3000,
              animation: `draw-line 2.5s cubic-bezier(0.22, 1, 0.36, 1) ${animationDelay}s forwards`
          }}
        />
      )}

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
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                      />
                    )}

                    {/* Glowing Pulsing Ring */}
                    {hoveredIndex === i && (
                      <circle
                          cx={p.x}
                          cy={p.y}
                          r={12}
                          fill={strokeColor}
                          opacity={0.3}
                          className="animate-ping-slow"
                          style={{ pointerEvents: 'none' }}
                      />
                    )}
                    
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === i ? 6 : 4}
                        fill={strokeColor}
                        stroke="white"
                        strokeWidth={2}
                        style={{ transition: 'r 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    />
                    {showValues && (
                      <text
                          x={p.x}
                          y={p.y - 12}
                          textAnchor="middle"
                          fill="white"
                          fontSize={11}
                          fontWeight={600}
                          style={{ 
                              opacity: 0,
                              animation: `fade-in-up 0.5s ease-out ${animationDelay + 0.8 + i * 0.05}s forwards`,
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
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-ping-slow {
          animation: ping-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping-pulse {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </g>
  );
}
