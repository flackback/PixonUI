import React from 'react';
import { cn } from '../../utils/cn';
import { Reveal } from '../feedback/Reveal';

export interface HeroTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The main title text
   */
  title: string;
  /**
   * Text to be highlighted with a gradient
   */
  highlight?: string;
  /**
   * Subtitle text below the main title
   */
  subtitle?: string;
  /**
   * Tailwind gradient classes for the highlight
   * @default 'from-blue-400 via-indigo-500 to-purple-600'
   */
  gradient?: string;
  /**
   * Enable entrance animation
   * @default true
   */
  animate?: boolean;
  /**
   * Add a subtle glow effect behind the highlighted text
   * @default true
   */
  glow?: boolean;
}

export const HeroText = ({
  title,
  highlight,
  subtitle,
  gradient = 'from-blue-400 via-indigo-500 to-purple-600',
  animate = true,
  glow = true,
  className,
  ...props
}: HeroTextProps) => {
  const content = (
    <div className={cn("flex flex-col items-center text-center space-y-6", className)} {...props}>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
        {title}{' '}
        {highlight && (
          <span className="relative inline-block">
            <span className={cn("bg-clip-text text-transparent bg-gradient-to-r", gradient)}>
              {highlight}
            </span>
            {glow && (
              <span className={cn(
                "absolute inset-0 blur-3xl opacity-40 -z-10 bg-gradient-to-r",
                gradient
              )} aria-hidden="true">
                {highlight}
              </span>
            )}
          </span>
        )}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (animate) {
    return (
      <Reveal direction="up" duration={1}>
        {content}
      </Reveal>
    );
  }

  return content;
};

HeroText.displayName = 'HeroText';
