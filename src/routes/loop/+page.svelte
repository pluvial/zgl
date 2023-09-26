<script lang="ts">
	import { Loop } from '$lib/index.js';
</script>

<Loop
	f={({ z, time }) => {
		z.adjustCanvas();
		z({
			time,
			Aspect: 'cover',
			FP: `
sin(length(XY)*vec3(30,30.5,31)
-time+atan(XY.x,XY.y)*3.),1`
		});
	}}
	--width="100vw"
	--height="100vh"
></Loop>

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
