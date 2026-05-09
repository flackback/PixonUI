import React from 'react';
import type { ChartDataPoint } from './Chart';
import { useChart, normalize } from './Chart';
import { cn } from '../../../utils/cn';

export interface AreaChartProps<T = any> {
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  showValues?: boolean;
  animationDelay?: number;
  curve?: 'linear' | 'smooth';
  onValueClick?: (data: ChartDataPoint<T>) => void;
}

export function AreaChart<T = any>({ 
  color = 'purple', 
  showValues = false, 
  animationDelay = 0,
  curve = 'smooth',
  onValueClick 
}: AreaChartProps<T>) {
  const { width, height, padding, data, maxValue, setHoveredIndex, hoveredIndex } = useChart<T>();
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Points are placed on edges for a continuous wave
  const itemWidth = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  const colors = {
    cyan: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.2)' },
    purple: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
    emerald: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' },
    amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' },
    rose: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.2)' },
  };

  const theme = colors[color] || colors.purple;

  // Generate Path Data
  const points = data.map((point, i) => {
    const x = padding.left + itemWidth * i;
    const y = height - padding.bottom - normalize(point.value, maxValue, chartHeight);
    return { x, y, item: point };
  });

  // Generate Smooth/Bezier Line Path
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0]!.x} ${points[0]!.y}`;
    if (curve === 'smooth' && points.length > 1) {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i]!;
        const p1 = points[i + 1]!;
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i]!.x} ${points[i]!.y}`;
      }
    }
  }

  // Area Path (closes the loop to the bottom of the grid)
  const areaPath = points.length > 0 ? `
    ${linePath}
    L ${padding.left + itemWidth * (points.length - 1)} ${height - padding.bottom}
    L ${padding.left} ${height - padding.bottom}
    Z
  ` : '';

  return (
    <g>
      <defs>
        {/* Dynamic Glowing linear gradient under the curve */}
        <linearGradient id={`area-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.35} />
          <stop offset="100%" stopColor={theme.stroke} stopOpacity={0.0} />
        </linearGradient>
        {/* Neon Glow Vector filter */}
        <filter id={`area-glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Area Gradient Fill */}
      {areaPath && (
        <path
          d={areaPath}
          fill={`url(#area-grad-${color})`}
          style={{ 
              opacity: 0,
              animation: `area-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${animationDelay}s forwards` 
          }}
        />
      )}

      {/* Neon Glow Line Underlay */}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={theme.stroke}
          strokeWidth={6}
          opacity={0.15}
          filter={`url(#area-glow-${color})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
              strokeDasharray: 2000,
              strokeDashoffset: 2000,
              animation: `draw-line 2s cubic-bezier(0.22, 1, 0.36, 1) ${animationDelay}s forwards`
          }}
        />
      )}

      {/* Primary Sharp Stroke Line */}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={theme.stroke}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
              strokeDasharray: 2000,
              strokeDashoffset: 2000,
              animation: `draw-line 2s cubic-bezier(0.22, 1, 0.36, 1) ${animationDelay}s forwards`
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
                          stroke="rgba(255, 255, 255, 0.25)"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                      />
                    )}
                    
                    {/* Concentric Halo Glowing Pulse */}
                    {hoveredIndex === i && (
                      <circle
                          cx={p.x}
                          cy={p.y}
                          r={12}
                          fill={theme.stroke}
                          opacity={0.3}
                          className="animate-ping-slow"
                          style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Main Bullet Point */}
                    <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === i ? 6 : 4}
                        fill={theme.stroke}
                        stroke="white"
                        strokeWidth={2}
                        style={{
                            transition: 'r 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
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
        @keyframes area-fade-in {
          from { opacity: 0; transform: scaleY(0.95); transform-origin: bottom; }
          to { opacity: 1; transform: scaleY(1); transform-origin: bottom; }
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
