<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	const snakeToCamel = (str: string) =>
		str
			.replace(/\w/, (letter) => letter.toUpperCase())
			.replace(/-\w/g, (letter) => letter[1].toUpperCase());

	$: name = snakeToCamel($page.params.name);
</script>

{#await import(`../../../demos/${name}.svelte`) then { default: Demo }}
	<Demo></Demo>
{/await}
