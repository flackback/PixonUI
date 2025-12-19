import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StepperProps {
  steps: { title: string; description?: string }[];
  currentStep: number;
  className?: string;
  onStepClick?: (step: number) => void;
}

export const Stepper = ({ steps, currentStep, className, onStepClick }: StepperProps) => {
  return (
    <div className={cn("flex w-full flex-col gap-4 md:flex-row", className)}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > index;
        const isCurrent = currentStep === index;
        const isClickable = !!onStepClick;

        return (
          <div 
            key={index} 
            className={cn(
              "flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4",
              isClickable && "cursor-pointer"
            )}
            onClick={() => isClickable && onStepClick(index)}
          >
            <div className="flex items-center gap-4 md:flex-col md:gap-2">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : isCurrent
                      ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                      : "border-gray-300 text-gray-500 dark:border-white/20 dark:text-white/40"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {/* Connector Line (Mobile: Right of circle, Desktop: Right of content) */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "ml-4 h-px flex-1 bg-gray-200 md:hidden dark:bg-white/10",
                      isCompleted && "bg-blue-600 dark:bg-blue-500"
                    )} 
                  />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrent || isCompleted ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-white/50"
                )}>
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-gray-500 dark:text-white/40 hidden md:block">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {/* Connector Line (Desktop) */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "hidden h-px flex-1 bg-gray-200 md:block dark:bg-white/10",
                  isCompleted && "bg-blue-600 dark:bg-blue-500"
                )} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
