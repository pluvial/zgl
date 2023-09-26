<script lang="ts">
	import { onMount } from 'svelte';
	import Canvas from './Canvas.svelte';
	import type { ZGL } from './zgl.js';

	export let f: (arg: { z: ZGL; time: number }) => void;

	let z: ZGL;

	onMount(() => z.stop);
</script>

<Canvas
	on:z={(e) => {
		z = e.detail;
		z.loop(f);
	}}
	{...$$restProps}><slot /></Canvas
>
