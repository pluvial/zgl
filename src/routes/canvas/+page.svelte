<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas, type ZGL } from '$lib/index.js';

	let z: ZGL;

	onMount(() => z.stop);
</script>

<Canvas
	on:z={(e) => {
		z = e.detail;
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
	}}
	--width="100vw"
	--height="100vh"
></Canvas>

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
