<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '$lib/index.js';
	import glsl_include from './include.glsl?raw';

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
				Inc: glsl_include,
				time: t / 1e3,
				Grid: [6, 1],
				Mesh: [20, 20],
				Aspect: 'fit',
				DepthTest: 1,
				VP: `
vec3 surface_f(vec2 xy) {
    vec3 pos = cubeVert(xy, ID.x);
    pos += sin(pos*PI+time).zxy*0.2;
    pos = mix(pos, normalize(pos)*1.5, sin(time)*0.8+0.2);
    pos.xy *= rot2(PI/4.+time*0.2);
    pos.yz *= rot2(PI/3.0);
    return pos*0.4;
}
void vertex() {
    varying vec3 color = cubeVert(vec2(0), ID.x)*0.5+0.5, normal;
    vec4 v = vec4(SURF(surface_f, XY, normal, 1e-3), 1.0);
    varying vec3 eyeDir = cameraPos()-v.xyz;
    VPos = wld2proj(v);
}`,
				FP: `
vec3 n = normalize(normal);
vec3 lightDir = normalize(vec3(0,1,1));
float diffuse = dot(n, lightDir)*0.5+0.5;
vec3 halfVec = normalize(lightDir+normalize(eyeDir));
float spec = smoothstep(0.998, 0.999, dot(halfVec, n));
FOut.rgb = color*diffuse + 0.3*spec;
vec2 m = UV*4.0;
FOut.rgb = mix(FOut.rgb, vec3(1.0), (isoline(m.x)+isoline(m.y))*0.25);`
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
