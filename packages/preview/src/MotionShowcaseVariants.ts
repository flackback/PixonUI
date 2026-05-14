export const cardVariants = {
  initial: { opacity: 0, x: -200, rotateX: 45, skewY: 10, filter: 'blur(10px)' },
  whileInView: { opacity: 1, x: 0, rotateX: 0, skewY: 0, filter: 'blur(0px)' }
};

export const gridTextVariants = {
  initial: { opacity: 0, scale: 0.3, letterSpacing: '32px', y: 200, rotateX: -45 },
  whileInView: { opacity: 1, scale: 1, letterSpacing: '0px', y: 0, rotateX: 0 }
};

export const footerTextVariants = {
  initial: { opacity: 0, y: 150, filter: 'blur(30px)', scale: 0.8, rotateX: 20 },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, rotateX: 0 }
};

export const floatingCardVariants = (i: number) => ({
  initial: {
    y: 400 + i * 100,
    x: i * 50 - 50,
    opacity: 0,
    scale: 0.5,
    rotateY: 90,
    rotateZ: i * 30 - 30
  },
  whileInView: {
    y: 0,
    x: i * 40 - 40,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    rotateZ: i * 8 - 8
  }
});

export const gridCardVariants = {
  initial: { opacity: 0, y: 150, rotateX: 90, scale: 0.6, filter: 'blur(10px)' },
  whileInView: { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' }
};

export const parallaxCardVariants = {
  initial: { opacity: 0, y: 80, scale: 0.85, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
};

export const springCardVariant = {
  initial: { opacity: 0, scale: 0.6, rotate: -15 },
  animate: { opacity: 1, scale: 1, rotate: 0 }
};
