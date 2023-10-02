<script lang="ts">
	import { Loop } from '$lib/index.js';
</script>

<Loop
	f={({ z, time }) => {
		z.adjustCanvas(1);

		const T = z(
			{
				time,
				FP: `
vec2 p = rot2(sin(time)*8.0*smoothstep(1.03,0.0, length(XY)))*XY;
FOut = vec4(smoothstep(-1.,1.,(p/fwidth(p)).y));`
			},
			{ size: [32, 32], tag: 'T' }
		);

		z({
			Aspect: 'mean',
			A: T.edge,
			B: T.mirror,
			C: T.linear.mirror,
			D: T.linear.repeat,
			FP: `
bool x=XY.x<0.0, y=XY.y<0.0;
vec2 p = fract(XY)*2.9-0.95;
FOut = y? (x?C(p):D(p)) : (x?A(p):B(p));`
		});
	}}
></Loop>
