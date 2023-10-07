import { z, loop, adjustCanvas } from './zgl.js';
import './style.css';

loop(({ time }) => {
  adjustCanvas();
  z({
    time,
    Aspect: 'cover',
    FP: `
sin(length(XY)*vec3(30,30.5,31)
-time+atan(XY.x,XY.y)*3.),1`,
  });
});
