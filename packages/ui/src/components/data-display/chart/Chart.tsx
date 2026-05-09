import React, { createContext, useContext, useState, useMemo } from 'react';
import { cn } from '../../../utils/cn';

// --- Types ---
export type ChartDataPoint<T = Record<string, any>> = {
  label: string;
  value: number;
} & T;

export interface ChartContextValue<T = any> {
  width: number;
  height: number;
  data: ChartDataPoint<T>[];
  maxValue: number;
  padding: { top: number; right: number; bottom: number; left: number };
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

// --- Context ---
const ChartContext = createContext<ChartContextValue<any> | undefined>(undefined);

export function useChart<T = any>() {
  const context = useContext(ChartContext);
  if (!context) throw new Error('Chart components must be used within a ChartContainer');
  return context as ChartContextValue<T>;
}

// --- Utils ---
export function normalize(value: number, max: number, height: number) {
  if (max === 0) return 0;
  return (value / max) * height;
}

// --- Components ---

export interface ChartContainerProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartDataPoint<T>[];
  height?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  children: React.ReactNode;
}

export function ChartContainer<T = any>({
  data,
  height = 300,
  padding = { top: 20, right: 20, bottom: 40, left: 40 },
  className,
  children,
  ...props
}: ChartContainerProps<T>) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 1;
    const max = Math.max(...data.map((d) => d.value));
    return max === 0 ? 1 : max * 1.1; // Add 10% headroom, min 1
  }, [data]);

  return (
    <ChartContext.Provider
      value={{
        width: containerWidth,
        height,
        data,
        maxValue,
        padding,
        hoveredIndex,
        setHoveredIndex,
      }}
    >
      <div
        ref={containerRef}
        className={cn("relative w-full select-none", className)}
        style={{ height }}
        {...props}
      >
        {containerWidth > 0 && (
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${containerWidth} ${height}`}
            className="overflow-visible"
          >
            {children}
          </svg>
        )}
      </div>
    </ChartContext.Provider>
  );
}

export function ChartGrid({ lines = 5 }: { lines?: number }) {
  const { width, height, padding } = useChart();
  const chartHeight = height - padding.top - padding.bottom;

  return (
    <g className="text-gray-200 dark:text-white/5">
      {Array.from({ length: lines + 1 }).map((_, i) => {
        const y = padding.top + (chartHeight / lines) * i;
        return (
          <line
            key={i}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        );
      })}
    </g>
  );
}

export function ChartXAxis() {
  const { width, height, padding, data } = useChart();
  const chartWidth = width - padding.left - padding.right;
  const itemWidth = chartWidth / data.length;

  return (
    <g>
      {data.map((point, i) => {
        const x = padding.left + itemWidth * i + itemWidth / 2;
        const y = height - padding.bottom + 20;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            className="fill-gray-400 dark:fill-white/40 text-xs font-medium"
          >
            {point.label}
          </text>
        );
      })}
    </g>
  );
}

export interface ChartTooltipProps {
  align?: 'center' | 'edge';
  renderTooltip?: (data: ChartDataPoint) => React.ReactNode;
}

export function ChartTooltip({ 
  align = 'center',
  renderTooltip 
}: ChartTooltipProps) {
  const { hoveredIndex, data, width, height, padding, maxValue } = useChart();
  
  if (hoveredIndex === null) return null;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Align correctly based on chart layout
  const itemWidth = align === 'center' 
    ? chartWidth / data.length 
    : chartWidth / (data.length - 1);

  const x = align === 'center'
    ? padding.left + itemWidth * hoveredIndex + itemWidth / 2
    : padding.left + itemWidth * hoveredIndex;

  const point = data[hoveredIndex];
  if (!point) return null;

  // Calculate accurate Y position of the point
  const y = height - padding.bottom - (point.value / maxValue) * chartHeight;

  // Simple default tooltip if none provided
  const content = renderTooltip ? renderTooltip(point) : (
    <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-gray-950/90 text-white px-3 py-2 text-xs shadow-2xl backdrop-blur-md flex flex-col gap-0.5 min-w-[120px] relative">
      <div className="font-semibold text-gray-300">{point.label}</div>
      <div className="text-sm font-black text-cyan-400">
        {point.value}
      </div>
      {/* Decorative tooltip caret arrow pointing down */}
      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-950/90 rotate-45 border-r border-b border-white/5" />
    </div>
  );

  return (
    <foreignObject
      x={x - 75} // Center horizontally (assuming 150px container width)
      y={y - 68} // Position beautifully floating 68px above the point
      width={150}
      height={80}
      className="pointer-events-none overflow-visible"
      style={{
        transition: 'all 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div className="flex flex-col items-center justify-end h-full w-full">
         <div className="animate-in fade-in zoom-in-95 duration-150">
            {content}
         </div>
      </div>
    </foreignObject>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex items-end justify-between gap-2 p-4 animate-pulse bg-gray-100 dark:bg-white/[0.02] rounded-2xl border border-gray-200 dark:border-white/5">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="w-full bg-gray-200 dark:bg-white/[0.03] rounded-t-lg" 
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  );
}
