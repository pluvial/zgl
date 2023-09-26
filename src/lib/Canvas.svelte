<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { zgl, type ZGL } from './zgl.js';

	const dispatch = createEventDispatcher();

	let canvas: HTMLCanvasElement;
	let z: ZGL;

	onMount(() => {
		z = zgl(canvas);
		dispatch('z', z);
	});
</script>

<canvas bind:this={canvas} {...$$restProps}><slot {canvas} {z} /></canvas>

<style>
	canvas {
		width: var(--width, 100%);
		height: var(--height, 100%);
	}
</style>
