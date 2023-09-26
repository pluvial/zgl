<script lang="ts">
	import { onMount } from 'svelte';
	import Canvas from './Canvas.svelte';
	import type { ZGL } from './zgl.js';

	export let f: (arg: { z: ZGL; time: number }) => void;

	export let canvas: HTMLCanvasElement | undefined = undefined;
	export let z: ZGL | undefined = undefined;

	onMount(() => z!.stop);
</script>

<Canvas
	bind:canvas
	bind:z
	on:z={(e) => {
		z = e.detail;
		z.loop(f);
	}}
	{...$$restProps}><slot /></Canvas
>
