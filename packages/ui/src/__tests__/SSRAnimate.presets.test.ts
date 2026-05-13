import { expect, test, describe } from 'vitest';
import { SSR_ANIMATE_PRESETS } from '../components/effects/SSRAnimate.presets';

describe('SSRAnimate Presets', () => {
  test('all presets are defined', () => {
    expect(Object.keys(SSR_ANIMATE_PRESETS).length).toBe(24);
  });

  test('presets contain expected structure', () => {
    for (const [name, preset] of Object.entries(SSR_ANIMATE_PRESETS)) {
      expect(preset).toBeDefined();
      expect(preset.initial).toBeDefined();
      expect(preset.animate).toBeDefined();
    }
  });

  test('specific presets exist and have correct values', () => {
    expect(SSR_ANIMATE_PRESETS.fadeIn.initial?.opacity).toBe(0);
    expect(SSR_ANIMATE_PRESETS.fadeIn.animate?.opacity).toBe(1);
    
    expect(SSR_ANIMATE_PRESETS.slideInUp.initial?.y).toBe('100%');
    expect(SSR_ANIMATE_PRESETS.slideInUp.animate?.y).toBe('0%');
  });

  test('snapshot of presets', () => {
    expect(SSR_ANIMATE_PRESETS).toMatchSnapshot();
  });
});
