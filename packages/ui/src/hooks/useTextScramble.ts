import { useState, useEffect, useRef } from 'react';

const GLYPHS = '01XYZ#%&@$+-/<>!_';

/**
 * Hook to create a "hacker" style text scramble reveal effect.
 */
export function useTextScramble(text: string, duration = 800, enabled = true) {
  const [output, setOutput] = useState(text);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      setOutput(text);
      return;
    }

    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      
      const scrambled = text.split('').map((char, i) => {
        if (char === ' ') return ' ';
        // Reveal character based on progress and position
        if (progress > (i / text.length)) return char;
        // Otherwise show a random glyph
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join('');

      setOutput(scrambled);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, duration, enabled]);

  return output;
}
