import zgl from './zgl.js';
import './style.css';

const z = zgl(document.querySelector('canvas')!);

z.loop(({ time }) => {
  z.adjustCanvas();
  z({
    time,
    Aspect: 'cover',
    FP: `
sin(length(XY)*vec3(30,30.5,31)
-time+atan(XY.x,XY.y)*3.),1`,
  });
});
