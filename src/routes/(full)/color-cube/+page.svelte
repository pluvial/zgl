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

		raf = requestAnimationFrame(function render() {
			raf = requestAnimationFrame(render);
			z.adjustCanvas();
			viewParams.canvasSize.set([canvas.clientWidth, canvas.clientHeight]);

			z({
				...viewParams,
				Inc: glsl_include,
				Grid: [10, 10, 10],
				Clear: [0.2, 0.2, 0.3, 1],
				Aspect: 'fit',
				DepthTest: 1,
				AlphaCoverage: 1,
				VP: `
        vec3 p = color = vec3(ID)/vec3(Grid-1);
        varying vec3 color = p;
        vec4 pos = vec4(p-0.5, 1);
        pos = wld2view(pos);
        pos.xy += XY*0.03;  // offset quad corners in view space
        VPos = view2proj(pos);`,
				FP: `
        float r = length(XY);
        float alpha = smoothstep(1.0, 1.0-fwidth(r), r);
        FOut = vec4(color, alpha);`
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
