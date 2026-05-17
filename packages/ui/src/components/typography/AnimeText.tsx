import React from 'react';
import { cn } from '../../utils/cn';
import { PixonMotion } from '../effects/Animate';

export type AnimeTextEffect = 'bounce' | 'fade-up' | 'rotate' | 'slide-left';

export interface AnimeTextProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  /**
   * O texto a ser animado, letra por letra.
   */
  text: string;
  /**
   * O efeito clássico estilo Anime.js a ser aplicado.
   * @default 'fade-up'
   */
  effect?: AnimeTextEffect;
  /**
   * Delay do stagger entre as letras.
   * @default 0.05
   */
  staggerDelay?: number;
  /**
   * Classe customizada.
   */
  className?: string;
  /**
   * Permite envolver por palavras ao invés de perder o espaçamento.
   */
  wordWrap?: boolean;
}

export const AnimeText = ({ 
  text, 
  effect = 'fade-up', 
  staggerDelay = 0.05, 
  className,
  wordWrap = true,
  ...props 
}: AnimeTextProps) => {
  const words = text.split(' ');

  const getVariants = () => {
    switch (effect) {
      case 'bounce':
        return {
          hidden: { opacity: 0, scale: 0.3 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'rotate':
        return {
          hidden: { opacity: 0, rotateX: -90, translateY: 20 },
          visible: { opacity: 1, rotateX: 0, translateY: 0 }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, translateX: -40 },
          visible: { opacity: 1, translateX: 0 }
        };
      case 'fade-up':
      default:
        return {
          hidden: { opacity: 0, translateY: 30 },
          visible: { opacity: 1, translateY: 0 }
        };
    }
  };

  const variants = getVariants();
  const transitionProps = effect === 'bounce' 
    ? { type: 'spring', stiffness: 300, damping: 10 } 
    : { duration: 0.6, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' };

  return (
    <PixonMotion
      className={cn('inline-flex flex-wrap', className)}
      variants={{
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
      }}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: staggerDelay }}
      {...props}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className={cn('inline-flex', wordWrap && 'mr-[0.25em]')}>
          {word.split('').map((char, charIndex) => (
            <PixonMotion
              key={charIndex}
              className="inline-block origin-bottom"
              variants={variants as any}
              transition={transitionProps as any}
            >
              {char}
            </PixonMotion>
          ))}
        </span>
      ))}
    </PixonMotion>
  );
};

AnimeText.displayName = 'AnimeText';
