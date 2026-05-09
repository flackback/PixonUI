import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Check, Info } from 'lucide-react';
import { Button } from '../button/Button';

export interface PricingGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * A responsive container for aligning multiple SaaS Pricing Cards
 */
export const PricingGrid = ({ children, className, ...props }: PricingGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 md:grid-cols-3 gap-8 items-stretch",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description: string;
  /** Fixed monthly base price */
  priceMonthly: number;
  /** Fixed annual price calculated as monthly equivalent or discounted */
  priceAnnual: number;
  /** Selected billing period: 'monthly' | 'annual' */
  billingPeriod?: 'monthly' | 'annual';
  /** Popular badge ribbon text */
  badge?: string;
  features: (string | PricingFeature)[];
  /** Action button properties */
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'glass' | 'shine' | 'cyber';
  onButtonClick?: () => void;
  /** Enable dynamic usage/seat calculator slider in card */
  enableCalculator?: boolean;
  calculatorLabel?: string;
  calculatorMin?: number;
  calculatorMax?: number;
  calculatorStep?: number;
  calculatorDefault?: number;
  /** Price multiplier per unit in the calculator */
  calculatorPricePerUnit?: number;
}

/**
 * An extremely premium and interactive Pricing Card.
 * Supports Monthly/Annual billing period toggles, dynamic seat/usage calculators
 * with animated sliders, custom features checklist, and high-fidelity call to action buttons.
 */
export const PricingCard = ({
  name,
  description,
  priceMonthly,
  priceAnnual,
  billingPeriod = 'monthly',
  badge,
  features,
  buttonText = "Get Started",
  buttonVariant = "primary",
  onButtonClick,
  enableCalculator = false,
  calculatorLabel = "Seats",
  calculatorMin = 1,
  calculatorMax = 100,
  calculatorStep = 1,
  calculatorDefault = 5,
  calculatorPricePerUnit = 8,
  className,
  ...props
}: PricingCardProps) => {
  const [units, setUnits] = useState(calculatorDefault);

  const basePrice = billingPeriod === 'monthly' ? priceMonthly : priceAnnual;
  const discountMultiplier = billingPeriod === 'annual' ? 0.8 : 1.0; // 20% discount on usage units if annual
  const calculatorAddition = enableCalculator ? (units * calculatorPricePerUnit * discountMultiplier) : 0;
  const totalPrice = Math.round(basePrice + calculatorAddition);

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 transition-all duration-300",
        "bg-white border border-zinc-200 text-zinc-900 shadow-sm",
        "dark:bg-zinc-900/40 dark:border-white/10 dark:text-white dark:shadow-md",
        "hover:shadow-xl hover:scale-[1.01] hover:border-purple-500/20 dark:hover:border-purple-500/30",
        badge && "border-purple-500 dark:border-purple-500 shadow-lg shadow-purple-500/5",
        className
      )}
      {...props}
    >
      {/* Decorative colored glow background spots */}
      {badge && (
        <div className="absolute top-0 right-0 h-[150px] w-[150px] bg-purple-500/10 blur-[80px] pointer-events-none rounded-full" />
      )}

      {/* Top Banner Ribbon */}
      {badge && (
        <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
          {badge}
        </span>
      )}

      {/* Card Header Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{name}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[85%]">{description}</p>
        </div>

        {/* Dynamic Calculator Interactive Panel */}
        {enableCalculator && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-zinc-600 dark:text-zinc-300 inline-flex items-center gap-1">
                {calculatorLabel}
                <TooltipTrigger content={`Pricing scales dynamically by additional ${calculatorLabel.toLowerCase()}`} />
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-500/10 px-2 py-0.5 rounded-lg">
                {units}
              </span>
            </div>
            <input
              type="range"
              min={calculatorMin}
              max={calculatorMax}
              step={calculatorStep}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className={cn(
                "w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-800",
                "accent-purple-600 dark:accent-purple-500"
              )}
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>{calculatorMin}</span>
              <span>{calculatorMax}</span>
            </div>
          </div>
        )}

        {/* Dynamic Price Display */}
        <div className="flex items-baseline gap-1 pt-2">
          <span className="text-sm font-semibold tracking-tight text-zinc-500 dark:text-zinc-400">$</span>
          <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white transition-all duration-300">
            {totalPrice}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">/mo</span>
        </div>
      </div>

      {/* Checklist Feature Section */}
      <div className="flex-grow my-8">
        <div className="h-px bg-zinc-100 dark:bg-white/5 w-full mb-6" />
        <ul className="space-y-4">
          {features.map((feature, idx) => {
            const isObj = typeof feature !== 'string';
            const fText = isObj ? (feature as PricingFeature).text : (feature as string);
            const fInc = isObj ? (feature as PricingFeature).included : true;

            return (
              <li
                key={idx}
                className={cn(
                  "flex items-start gap-3 text-sm",
                  fInc ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700"
                )}
              >
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  fInc 
                    ? "border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400" 
                    : "border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-300 dark:text-zinc-600"
                )}>
                  {fInc && <Check className="h-3 w-3" />}
                </div>
                <span>{fText}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Call to Action Button */}
      <div className="mt-auto">
        <Button
          variant={buttonVariant}
          onClick={onButtonClick}
          className="w-full h-12 rounded-2xl"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

/* Micro helper for pricing calculator description */
const TooltipTrigger = ({ content }: { content: string }) => {
  return (
    <span className="group/tooltip relative inline-flex cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
      <Info className="h-3.5 w-3.5" />
      <span className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl text-[10px] leading-relaxed shadow-lg",
        "bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700",
        "opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-250 pointer-events-none z-50 text-center"
      )}>
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
      </span>
    </span>
  );
};
