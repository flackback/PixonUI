import React, { useRef, useState } from 'react';
import { Surface } from '../../primitives/Surface';
import { Text } from '../typography/Text';
import { Heading } from '../typography/Heading';
import { Badge } from '../../primitives/Badge';
import { cn } from '../../utils/cn';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, trend, icon, className, ...props }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;

      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
      <Surface
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'relative overflow-hidden p-6 transition-all duration-300 hover:border-white/20',
          className
        )}
        {...props}
      >
        {/* Glow Effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Text variant="muted" className="font-medium">
              {title}
            </Text>
            {icon && <div className="text-white/40">{icon}</div>}
          </div>

          <div className="flex items-end justify-between gap-4">
            <Heading as="h3" className="text-3xl">
              {value}
            </Heading>

            {trend && (
              <Badge variant={trend.isPositive ? 'success' : 'danger'}>
                {trend.isPositive ? '+' : ''}
                {trend.value}
              </Badge>
            )}
          </div>
        </div>
      </Surface>
    );
  }
);

MetricCard.displayName = 'MetricCard';