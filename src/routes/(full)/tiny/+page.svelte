<script lang="ts">
	import { onMount } from 'svelte';
	import zgl from '$lib/index.js';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const z = zgl(canvas);
		z.loop(({ time }) => {
			z.adjustCanvas();
			z({
				time,
				Aspect: 'cover',
				FP: `
sin(length(XY)*vec3(30,30.5,31)
-time+atan(XY.x,XY.y)*3.),1`
			});
		});
		return z.stop;
	});
</script>

<canvas bind:this={canvas} />

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
