import React from 'react';
import { PixonSSRAnimate } from './SSRAnimate';
import type { SSR_ANIMATE_PRESETS } from './SSRAnimate.presets';

type SafeHTMLTags = 'div' | 'section' | 'article' | 'span' | 'li' | 'ul' | 'main' | 'header' | 'footer' | 'nav';

export interface SSRStaggerProps {
  children: React.ReactNode;
  delay?: number;        // base delay ms (default 0)
  stagger?: number;      // ms entre filhos (default 80)
  preset?: keyof typeof SSR_ANIMATE_PRESETS;
  trigger?: 'load' | 'view';
  as?: SafeHTMLTags;
}

export function SSRStagger({
  children,
  delay = 0,
  stagger = 80,
  preset = 'fadeInUp',
  trigger = 'load',
  as: Component = 'div',
}: SSRStaggerProps) {
  return (
    <Component>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;

        // Each child is wrapped in an SSRAnimate component to orchestrate the stagger
        // Using native CSS variables and delays to keep it 100% RSC-safe
        return (
          <PixonSSRAnimate
            preset={preset}
            trigger={trigger}
            style={{ '--pixon-stagger-i': i } as React.CSSProperties}
            transition={{ delay: delay + i * stagger }}
          >
            {child}
          </PixonSSRAnimate>
        );
      })}
    </Component>
  );
}

export default SSRStagger;
