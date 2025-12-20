import React from 'react';
import { useChart, normalize, ChartDataPoint } from './Chart';
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
    cyan: 'from-cyan-500 to-blue-600',
    purple: 'from-purple-500 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-400 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
  };

  return (
    <g>
      {data.map((point, i) => {
        const barHeight = normalize(point.value, maxValue, chartHeight);
        const x = padding.left + itemWidth * i + (itemWidth - barWidth) / 2;
        const y = height - padding.bottom - barHeight;
        const isHovered = hoveredIndex === i;
        const delay = i * 0.1 + animationDelay; // Slower stagger for smoothness

        return (
          <g 
            key={i} 
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onValueClick?.(point)}
            className={cn("cursor-pointer", onValueClick && "cursor-pointer")}
          >
            {/* Invisible hit area for easier hovering */}
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
              rx={4}
              className={cn(
                "transition-all duration-300 ease-out",
                isHovered ? "brightness-125 filter" : "opacity-80"
              )}
              style={{
                transformOrigin: `center ${height - padding.bottom}px`,
                animation: `grow-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s backwards`
              }}
            >
               {/* Gradient Definition would be better in defs, but inline style works for dynamic colors if needed. 
                   Here we use classes for gradients. */}
            </rect>
            
            {/* Gradient Overlay via Class */}
            <rect
               x={x}
               y={y}
               width={barWidth}
               height={barHeight}
               rx={4}
               className={cn("bg-gradient-to-b", colors[color])}
               style={{
                pointerEvents: 'none',
                transformOrigin: `center ${height - padding.bottom}px`,
                animation: `grow-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s backwards`
               }}
            />

            {/* Value Label */}
            {showValues && (
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill="white"
                fontSize={12}
                fontWeight={500}
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </g>
  );
}
