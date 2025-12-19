import { useState, useEffect, useCallback } from 'react';

export interface ScrollValues {
  scrollX: number;
  scrollY: number;
  scrollProgressX: number;
  scrollProgressY: number;
}

export function useScroll(): ScrollValues {
  const [values, setValues] = useState<ScrollValues>({
    scrollX: 0,
    scrollY: 0,
    scrollProgressX: 0,
    scrollProgressY: 0,
  });

  const handleScroll = useCallback(() => {
    const x = window.scrollX;
    const y = window.scrollY;
    
    const width = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    setValues({
      scrollX: x,
      scrollY: y,
      scrollProgressX: width > 0 ? x / width : 0,
      scrollProgressY: height > 0 ? y / height : 0,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return values;
}
