<script lang="ts">
	// import { zgl } from '$lib/index.js';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(async () => {
		const { zgl } = await import('$lib/index.js');
		const glsl = zgl(canvas);
		glsl.loop(({ time }) => {
			glsl.adjustCanvas();
			glsl({
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
