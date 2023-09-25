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
	});
</script>

<canvas bind:this={canvas} />

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	canvas {
		width: 100vw;
		height: 100vh;
	}
</style>
