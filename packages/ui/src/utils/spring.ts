export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  precision?: number;
  fps?: number;
}

/**
 * Pre-calculates a physics-based spring trajectory into an array of normalized values (0 to 1).
 * Uses Verlet integration for accurate harmonic oscillator simulation.
 */
export function generateSpringKeyframes({
  stiffness = 100,
  damping = 10,
  mass = 1,
  velocity = 0,
  precision = 0.01,
  fps = 60,
}: SpringOptions = {}): {
  keyframes: number[];
  duration: number;
} {
  const dt = 1 / fps; // timestep in seconds
  let x = 0;          // initial position (0)
  let v = velocity;   // initial velocity
  const target = 1;   // target position (1)

  const keyframes: number[] = [x];
  let time = 0;

  // Safety limits to prevent infinite loops (max 10 seconds simulation)
  const maxTime = 10; 
  let isSettled = false;

  while (!isSettled && time < maxTime) {
    // Spring force: F = -k*x - c*v
    // Since target is 1, displacement is (x - target)
    const displacement = x - target;
    const force = -stiffness * displacement - damping * v;
    
    // a = F / m
    const acceleration = force / mass;
    
    // Euler integration step
    v += acceleration * dt;
    x += v * dt;
    
    time += dt;
    keyframes.push(x);

    // Consider settled if displacement and velocity are both within precision tolerance
    if (Math.abs(x - target) <= precision && Math.abs(v) <= precision) {
      isSettled = true;
    }
  }

  // Ensure the final keyframe ends exactly at the target 1.0 to avoid CSS snapping
  if (keyframes.length > 0) {
    keyframes[keyframes.length - 1] = 1;
  }

  return {
    keyframes,
    duration: time * 1000, // convert seconds to ms
  };
}
