<script lang="ts">
	import './style.css';

	const demos = import.meta.glob('../../demos/*.svelte');

	const pathToName = (path: string) => path.split('/').pop()!.split('.').shift()!;
	const camelToKebab = (str: string) =>
		str
			.replace(/[A-Z]/, (letter) => letter.toLowerCase())
			.replace(/[A-Z]/g, (letter: string) => `-${letter.toLowerCase()}`);
</script>

<ul>
	{#each Object.keys(demos) as path}
		{@const name = pathToName(path)}
		<li>
			<a href="/demos/{camelToKebab(name)}">{name}</a>
		</li>
	{/each}
</ul>

<slot />

<style>
	ul {
		position: absolute;
		list-style: none;
		font-family: sans-serif;
		font-size: 1.2em;
		opacity: 0;
		transition: opacity 0.3s;

		&:hover {
			opacity: 1;
		}
	}

	a {
		color: #fff;
	}
</style>
