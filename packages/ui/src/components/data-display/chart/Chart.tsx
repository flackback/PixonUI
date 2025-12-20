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
    return Math.max(...data.map((d) => d.value)) * 1.1; // Add 10% headroom
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

export function ChartTooltip({ 
  renderTooltip 
}: { 
  renderTooltip?: (data: ChartDataPoint) => React.ReactNode 
}) {
  const { hoveredIndex, data, width, padding } = useChart();
  
  if (hoveredIndex === null) return null;

  const chartWidth = width - padding.left - padding.right;
  const itemWidth = chartWidth / data.length;
  const x = padding.left + itemWidth * hoveredIndex + itemWidth / 2;
  const point = data[hoveredIndex];

  if (!point) return null;

  // Simple default tooltip if none provided
  const content = renderTooltip ? renderTooltip(point) : (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/80 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <div className="font-semibold text-gray-900 dark:text-white">{point.label}</div>
      <div className="text-gray-500 dark:text-white/70">Value: {point.value}</div>
    </div>
  );

  return (
    <foreignObject
      x={x - 75} // Center roughly (150px width assumed)
      y={0}
      width={150}
      height="100%"
      className="pointer-events-none overflow-visible"
    >
      <div className="flex h-full flex-col justify-center items-center">
         <div className="animate-in fade-in zoom-in-95 duration-200">
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
