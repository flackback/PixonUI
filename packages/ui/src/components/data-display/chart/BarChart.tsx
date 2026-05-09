import React from 'react';
import type { ChartDataPoint } from './Chart';
import { useChart, normalize } from './Chart';
import { cn } from '../../../utils/cn';

export interface BarChartProps<T = any> {
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  showValues?: boolean;
  animationDelay?: number;
  onValueClick?: (data: ChartDataPoint<T>) => void;
}

export function BarChart<T = any>({ 
  color = 'cyan', 
  showValues = false, 
  animationDelay = 0,
  onValueClick 
}: BarChartProps<T>) {
  const { width, height, padding, data, maxValue, setHoveredIndex, hoveredIndex } = useChart<T>();
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const itemWidth = chartWidth / data.length;
  const barWidth = itemWidth * 0.6; // 60% of slot width

  const colors = {
    cyan: { stop1: '#22d3ee', stop2: '#06b6d4' },
    purple: { stop1: '#c084fc', stop2: '#8b5cf6' },
    emerald: { stop1: '#34d399', stop2: '#10b981' },
    amber: { stop1: '#fde047', stop2: '#f59e0b' },
    rose: { stop1: '#fda4af', stop2: '#f43f5e' },
  };

  const theme = colors[color] || colors.cyan;

  return (
    <g>
      <defs>
        {/* Native SVG Linear Gradient for Cross-browser high-fidelity fills */}
        <linearGradient id={`bar-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.stop1} />
          <stop offset="100%" stopColor={theme.stop2} />
        </linearGradient>
        {/* Glow filter for hovered bars */}
        <filter id={`bar-glow-${color}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {data.map((point, i) => {
        const barHeight = normalize(point.value, maxValue, chartHeight);
        const x = padding.left + itemWidth * i + (itemWidth - barWidth) / 2;
        const y = height - padding.bottom - barHeight;
        const isHovered = hoveredIndex === i;
        const delay = i * 0.08 + animationDelay; // Fluid staggered entry

        return (
          <g 
            key={i} 
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onValueClick?.(point)}
            className={cn("cursor-pointer", onValueClick && "cursor-pointer")}
          >
            {/* Invisible expanded hit area for buttery smooth hover trigger */}
            <rect
              x={padding.left + itemWidth * i}
              y={padding.top}
              width={itemWidth}
              height={chartHeight}
              fill="transparent"
            />
            
            {/* The Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6} // Pill-rounded modern styling
              fill={`url(#bar-grad-${color})`}
              className={cn(
                "transition-all duration-300 ease-out origin-bottom",
                isHovered ? "brightness-110 saturate-110" : "opacity-90"
              )}
              style={{
                transformOrigin: `${x + barWidth / 2}px ${height - padding.bottom}px`,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                filter: isHovered ? `drop-shadow(0 4px 12px ${theme.stop2}40)` : undefined,
                animation: `grow-up 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s backwards`
              }}
            />
            
            {/* Value Label */}
            {showValues && (
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontWeight={600}
                style={{ 
                  opacity: 0,
                  animation: `fade-in-up 0.5s ease-out ${delay + 0.4}s forwards`,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {point.value}
              </text>
            )}
          </g>
        );
      })}
      <style>{`
        @keyframes grow-up {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </g>
  );
}
