<script lang="ts">
	import { page } from '$app/stores';
	import demos, { pathToName } from '../../../demos/index.svelte.js';

	$: Demo = demos[pathToName[$page.params.name]];

	// non-reactive version:
	// const name = snakeToCamel($page.params.name);
	// const Demo = demos[pathToName[$page.params.name]];
</script>

<svelte:component this={Demo} />

<!-- <Demo></Demo> -->

<!-- 
{#await import(`../../../demos/${name}.svelte`) then { default: Demo }}
	<Demo></Demo>
{/await}
-->
