import { z, adjustCanvas } from './zgl.js';

// type Easing = (x: number) => number;
type Easing = 0 | 1 | 2;
const linear = (x: number) => x;
const easings = [linear, linear, linear];

type EasingSequences = Record<string, Easing[]>;

type Uniforms = Record<string, number>;
type UniformSequences = Record<string, number[]>;

type Pattern = [string, UniformSequences, EasingSequences];
const patterns: Pattern[] = [
  [
    `sin(length(XY)*vec3(30,30.5,31)
-t+atan(XY.x-a,XY.y-b)*3.),1`,
    { a: [-0.7, 0, 0.7], b: [0.7, 0, -0.7] },
    { a: [0, 0], b: [0, 0] },
  ],
];

const fpp = 1000;

function animation(frame: number): [string, Uniforms] {
  const uniforms = { t: frame / 60, a: 0, b: 0 };
  const p = Math.floor((frame / fpp) % patterns.length);
  const pattern = patterns[p];
  const [shader, uniformSequences, easingSequences] = pattern;
  for (const [name, sequence] of Object.entries(uniformSequences)) {
    const step = frame % fpp;
    const fpk = fpp / sequence.length;
    const keyframe = Math.floor(step / fpk);
    const easing = easings[easingSequences[name][keyframe]];
    const v0 = sequence[keyframe];
    const vf = sequence[keyframe + 1];
    const v = v0 + (vf - v0) * easing((step - keyframe * fpk) / fpk);
    uniforms[name] = v;
  }
  return [shader, uniforms];
}

let frame = 0;
(function loop() {
  const [shader, uniforms] = animation(frame++);
  adjustCanvas();
  z({
    Aspect: 'cover',
    FP: shader,
    ...uniforms,
  });
  requestAnimationFrame(loop);
})();
