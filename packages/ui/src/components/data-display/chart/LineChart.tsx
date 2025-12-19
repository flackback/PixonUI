import React from 'react';
import { useChart, normalize } from './Chart';
import { cn } from '../../../utils/cn';

export interface LineChartProps {
  color?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  showValues?: boolean;
  animationDelay?: number;
  curve?: 'linear' | 'smooth' | 'step';
  strokeWidth?: number;
  align?: 'center' | 'edge';
  onValueClick?: (data: any) => void;
}

export function LineChart({ 
  color = 'cyan', 
  showValues = false, 
  animationDelay = 0,
  curve = 'smooth',
  strokeWidth = 3,
  align = 'edge',
  onValueClick 
}: LineChartProps) {
  const { width, height, padding, data, maxValue, setHoveredIndex, hoveredIndex } = useChart();
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Align 'center' matches BarChart (bands), 'edge' matches AreaChart (points)
  const itemWidth = align === 'center' 
    ? chartWidth / data.length 
    : chartWidth / (data.length - 1);

  const colors = {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  };

  const strokeColor = colors[color];

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
    return { x, y };
  });

  // Generate Path Command
  let d = '';
  if (points.length > 0) {
    d = `M ${points[0]!.x} ${points[0]!.y}`;
    
    if (curve === 'smooth') {
      // Simple Catmull-Rom or Bezier approximation could go here, 
      // but for now let's use a simple cubic bezier strategy or just straight lines if complex.
      // Actually, let's do a simple smoothing by using midpoints for control points if requested,
      // or just standard SVG commands.
      // For simplicity and robustness without a library like d3-shape, let's stick to linear or a basic smooth approximation.
      
      // Basic smooth strategy: Cubic Bezier between points
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i]!;
        const p1 = points[i + 1]!;
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
    } else if (curve === 'step') {
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
      {/* The Line */}
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-line"
        style={{
            strokeDasharray: 3000,
            strokeDashoffset: 3000,
            animation: `draw-line 2.5s ease-out ${animationDelay}s forwards`
        }}
      />

      {/* Interactive Points */}
      {points.map((p, i) => (
        <g 
            key={i} 
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onValueClick?.(data[i])}
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
                        fill={strokeColor}
                        stroke="white"
                        strokeWidth={2}
                        style={{ transition: 'r 0.2s ease-out' }}
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
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </g>
  );
}
