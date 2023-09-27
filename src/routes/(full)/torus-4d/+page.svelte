<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '$lib/index.js';

	const glsl_include = `
uniform bool xrMode;
uniform mat4 xrProjectionMatrix, xrViewMatrix;
uniform mat4 xrRay[2], xrRayInv[2];
uniform vec4 xrButton[2];
uniform vec3 xrPosition;

uniform vec3 cameraYPD;
vec3 cameraPos() {
    if (xrMode) return xrPosition;
    vec3 p = vec3(0, 0, cameraYPD.z);
    p.yz *= rot2(-cameraYPD.y);
    p.xy *= rot2(-cameraYPD.x);
    return p;
}
vec4 wld2view(vec4 p) {
    if (xrMode) return xrViewMatrix * p;
    p.xy *= rot2(cameraYPD.x);
    p.yz *= rot2(cameraYPD.y);
    p.z -= cameraYPD.z;
    return p;
}
vec4 view2proj(vec4 p) {
    if (xrMode) return xrProjectionMatrix*p;
    const float near = 0.1, far = 10.0, fov = 1.0;
    return vec4(p.xy/tan(fov/2.0),
        (p.z*(near+far)+2.0*near*far)/(near-far), -p.z);
}
vec4 wld2proj(vec4 p) {
    return view2proj(wld2view(p));
}
vec4 wld2proj(vec3 p) {
    return wld2proj(vec4(p,1.0));
}
`;

	const params = { Inc: glsl_include };

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
				Mesh: [100, 100],
				Aspect: 'fit',
				AlphaCoverage: 1,
				DepthTest: 1,
				VP: `
vec4 p = vec4(cos(XY*PI), sin(XY*PI))*0.6;
p.xw *= rot2(time*0.4);
VPos = wld2proj(vec4(p.xyz/(1.0-p.w)*0.5, 1));`,
				FP: `
vec2 v = UV*rot2(PI/4.)*64.0/sqrt(2.);
v = smoothstep(0.0, 1.0, (abs(v-round(v))-0.02)/fwidth(v));
float a = 1.0-v.x*v.y;
if (a<0.1) discard;
FOut = vec4(gl_FrontFacing?vec3(.9,.9,.6):vec3(.6,.6,.9), a);`
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
