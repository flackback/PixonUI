/**
 * PixonMotion GPU-Only Effects
 * 
 * Regra: 0% CPU, 100% GPU
 */

/**
 * Magnetic effect - 100% GPU
 */
export function gpuMagnetic(
  element: HTMLElement,
  options: { strength?: number } = {}
): () => void {
  const { strength = 0.15 } = options;

  element.style.willChange = 'transform';
  element.style.transition = 'transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)';

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
  };

  const onMouseLeave = () => {
    element.style.transform = 'translate3d(0, 0, 0)';
  };

  element.addEventListener('mousemove', onMouseMove, { passive: true });
  element.addEventListener('mouseleave', onMouseLeave, { passive: true });

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
    element.style.willChange = 'auto';
    element.style.transition = '';
    element.style.transform = '';
  };
}

/**
 * Glow effect - 100% GPU via CSS filter + box-shadow
 */
export function gpuGlow(
  element: HTMLElement,
  options: { color?: string; intensity?: number } = {}
): () => void {
  const { color = '#3b82f6', intensity = 0.6 } = options;
  const blurVal = Math.round(20 * intensity);
  const spreadVal = Math.round(10 * intensity);

  element.style.willChange = 'box-shadow';
  element.style.transition = 'box-shadow 0.3s ease';
  
  const onMouseEnter = () => {
    element.style.boxShadow = `0 0 ${blurVal}px ${spreadVal}px ${color}`;
  };

  const onMouseLeave = () => {
    element.style.boxShadow = 'none';
  };

  element.addEventListener('mouseenter', onMouseEnter, { passive: true });
  element.addEventListener('mouseleave', onMouseLeave, { passive: true });

  return () => {
    element.removeEventListener('mouseenter', onMouseEnter);
    element.removeEventListener('mouseleave', onMouseLeave);
    element.style.willChange = 'auto';
    element.style.boxShadow = '';
    element.style.transition = '';
  };
}

/**
 * Scale on hover - 100% CSS/GPU
 */
export function hoverScale(element: HTMLElement, scaleVal = 1.05): () => void {
  element.style.willChange = 'transform';
  element.style.transition = 'transform 0.25s cubic-bezier(0.33, 1, 0.68, 1)';

  const onMouseEnter = () => {
    element.style.transform = `scale3d(${scaleVal}, ${scaleVal}, 1)`;
  };

  const onMouseLeave = () => {
    element.style.transform = 'scale3d(1, 1, 1)';
  };

  element.addEventListener('mouseenter', onMouseEnter, { passive: true });
  element.addEventListener('mouseleave', onMouseLeave, { passive: true });

  return () => {
    element.removeEventListener('mouseenter', onMouseEnter);
    element.removeEventListener('mouseleave', onMouseLeave);
    element.style.willChange = 'auto';
    element.style.transition = '';
    element.style.transform = '';
  };
}

/**
 * Tilt 3D - GPU only
 */
export function gpuTilt3D(
  element: HTMLElement,
  options: { maxTilt?: number; perspective?: number } = {}
): () => void {
  const { maxTilt = 15, perspective = 1000 } = options;

  element.style.willChange = 'transform';
  element.style.transition = 'transform 0.15s ease-out';
  element.style.transformStyle = 'preserve-3d';
  if (element.parentElement) {
    element.parentElement.style.perspective = `${perspective}px`;
  }

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const tiltX = (y - 0.5) * maxTilt * 2;
    const tiltY = (x - 0.5) * -maxTilt * 2;

    element.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1)`;
  };

  const onMouseLeave = () => {
    element.style.transform = 'rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  element.addEventListener('mousemove', onMouseMove, { passive: true });
  element.addEventListener('mouseleave', onMouseLeave, { passive: true });

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
    element.style.willChange = 'auto';
    element.style.transition = '';
    element.style.transform = '';
  };
}

/**
 * Fade in on scroll - GPU via IntersectionObserver + CSS
 */
export function fadeInOnScroll(
  element: HTMLElement,
  durationVal = 600
): () => void {
  element.style.willChange = 'transform, opacity';
  element.style.opacity = '0';
  element.style.transform = 'translate3d(0, 30px, 0)';
  element.style.transition = `opacity ${durationVal}ms ease, transform ${durationVal}ms ease`;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.style.opacity = '1';
          element.style.transform = 'translate3d(0, 0, 0)';
          observer.disconnect();
          
          setTimeout(() => {
            element.style.willChange = 'auto';
          }, durationVal + 50);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(element);

  return () => {
    observer.disconnect();
    element.style.willChange = 'auto';
  };
}

/**
 * Parallax scroll - GPU via CSS transform
 */
export function parallaxScroll(
  element: HTMLElement,
  speed = 0.5
): () => void {
  element.style.willChange = 'transform';

  const onScroll = () => {
    const scrollY = window.scrollY;
    const offset = scrollY * speed;
    element.style.transform = `translate3d(0, ${offset}px, 0)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    element.style.willChange = 'auto';
    element.style.transform = '';
  };
}
