<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import demos from '../../../demos/index.svelte.js';

	const snakeToCamel = (str: string) =>
		str
			.replace(/\w/, (letter) => letter.toUpperCase())
			.replace(/-\w/g, (letter) => letter[1].toUpperCase());

	$: name = snakeToCamel($page.params.name);
	$: Demo = demos[name];
	
	// non-reactive version:
	// const name = snakeToCamel($page.params.name);
	// const Demo = demos[name];
</script>

<svelte:component this={Demo} />
<!-- <Demo></Demo> -->
<!-- 
{#await import(`../../../demos/${name}.svelte`) then { default: Demo }}
	<Demo></Demo>
{/await}
-->
