<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '$lib/index.js';
	import glsl_include from '../../glsl/include.glsl?raw';

	let canvas: HTMLCanvasElement;

	let viewParams = {
		canvasSize: new Float32Array(2),
		pointer: new Float32Array(3),
		cameraYPD: new Float32Array(3)
	};

	let raf: number;

	onMount(() => () => cancelAnimationFrame(raf));

	function resetCamera() {
		viewParams.cameraYPD.set([(Math.PI * 3) / 4, Math.PI / 4, 1.8]);
	}

	function setPointer(e: PointerEvent, buttons: number) {
		const [w, h] = viewParams.canvasSize;
		const [x, y] = [e.offsetX - w / 2, h / 2 - e.offsetY];
		viewParams.pointer.set([x, y, buttons]);
		return [x, y];
	}
</script>

<Canvas
	bind:canvas
	on:z={(e) => {
		const z = e.detail;

		resetCamera();

		raf = requestAnimationFrame(function render(t) {
			raf = requestAnimationFrame(render);
			z.adjustCanvas(1);
			viewParams.canvasSize.set([canvas.clientWidth, canvas.clientHeight]);

			z({
				...viewParams,
				time: t / 1e3,
				Inc: glsl_include,
				Mesh: [64, 128],
				Grid: [5, 5],
				Aspect: 'fit',
				DepthTest: 1,
				VP: `
vec3 surface_f(vec2 p) {
    vec2 c = sin(time+p*vec2(ID)*TAU);
    vec3 pos = torus(p, 1.0, 0.4 + 0.1*c.x + 0.15*c.y)/8.0;
    pos.xy += (vec2(ID)-vec2(Grid-1)*0.5)*0.4;
    return pos;
}
void vertex() {
    varying vec3 normal;
    vec4 pos = vec4(SURF(surface_f, UV, normal, 1e-3), 1.0);
    VPos = wld2proj(pos);
}`,
				FP: `
FOut = vec4(normal*0.6, 1);
vec2 m = UV*vec2(Mesh)/4.0;
FOut.rgb += (isoline(m.x)+isoline(m.y))*0.2;
// useful for debugging incorrect face ordering
// FOut.r += float(!gl_FrontFacing);
`
			});
		});
	}}
	on:pointerdown={(e) => {
		if (!e.isPrimary) return;
		setPointer(e, e.buttons);
	}}
	on:pointerout={(e) => setPointer(e, 0)}
	on:pointerup={(e) => setPointer(e, 0)}
	on:pointermove={(e) => {
		const [px, py, _] = viewParams.pointer;
		const [x, y] = setPointer(e, e.buttons);
		if (!e.isPrimary || e.buttons != 1) return;
		let [yaw, pitch, dist] = viewParams.cameraYPD;
		yaw -= (x - px) * 0.01;
		pitch += (y - py) * 0.01;
		pitch = Math.min(Math.max(pitch, 0), Math.PI);
		viewParams.cameraYPD.set([yaw, pitch, dist]);
	}}
></Canvas>
