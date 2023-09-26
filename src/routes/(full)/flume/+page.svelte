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
sin(length(XY*time/3.)*vec3(1,2,3)*7.
-time/3.*vec3(3,1,2))+atan(XY.x,XY.y)*3.,1`
			});
		});
		return z.stop;
	});
</script>

<canvas bind:this={canvas} />

<style>
	canvas {
		width: 100vw;
		height: 100vh;
	}
</style>
