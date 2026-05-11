import React from 'react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { cn } from '../../utils/cn';

export interface ScrollSpyItem {
  id: string;
  label: string;
}

export interface ScrollSpyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * List of target elements ids and labels
   */
  items: ScrollSpyItem[];
  /**
   * Optional custom active element ID override
   */
  activeId?: string;
}

export const ScrollSpy = ({
  items,
  activeId: activeIdOverride,
  className,
  ...props
}: ScrollSpyProps) => {
  const ids = React.useMemo(() => items.map((item) => item.id), [items]);
  const detectedActiveId = useScrollSpy(ids);
  const activeId = activeIdOverride || detectedActiveId;

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // height of an average top navigation bar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col gap-1 py-4 px-3 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 min-w-[200px]',
        className
      )}
      {...props}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-3 px-2">
        Nesta Página
      </div>

      <div className="relative flex flex-col gap-1.5 border-l border-white/5 pl-2 ml-1">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleScrollTo(item.id, e)}
              className={cn(
                'relative text-sm transition-all duration-300 py-1.5 px-3 rounded-lg flex items-center select-none font-medium',
                isActive
                  ? 'text-blue-400 bg-blue-500/10 shadow-sm border border-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              )}
            >
              {/* Active neon dot indicator */}
              {isActive && (
                <span className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
              )}
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
};

ScrollSpy.displayName = 'ScrollSpy';
