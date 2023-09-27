<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { zgl, type ZGL } from './zgl.js';

	const dispatch = createEventDispatcher<{ z: ZGL }>();

	export let canvas: HTMLCanvasElement | undefined = undefined;
	export let z: ZGL | undefined = undefined;

	onMount(() => {
		z = zgl(canvas!);
		dispatch('z', z);
	});
</script>

<canvas
	bind:this={canvas}
	{...$$restProps}
	on:click
	on:mousedown
	on:mouseup
	on:mousemove
	on:mouseenter
	on:mouseleave
	on:mousewheel
	on:pointerdown
	on:pointerup
	on:pointercancel
	on:pointermove
	on:pointerenter
	on:pointerover
	on:pointerleave
	on:pointerout><slot /></canvas
>

<style>
	canvas {
		width: var(--width, 100%);
		height: var(--height, 100%);
	}
</style>
