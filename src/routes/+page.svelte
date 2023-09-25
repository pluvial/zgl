<script lang="ts">
	import { onMount } from 'svelte';

	// import { DemoApp } from './demo/main.js';
	import type { DemoApp } from './demo/main.js';
	import demos from './demo/index.js';

	let app: DemoApp;

	onMount(async () => {
		const { DemoApp } = await import('./demo/main.js');
		app = new DemoApp(demos);
	});

	function fullscreen() {
		app.fullscreen();
	}
	function toggleGui() {
		app.toggleGui();
	}
	function toggleVR() {
		app.toggleXR('vr');
	}
	function toggleAR() {
		app.toggleXR('ar');
	}
</script>

<svelte:head>
	<script src="/dat.gui.min.js"></script>
</svelte:head>

<details id="panel" open>
	<summary><a href="https://github.com/pluvial/zgl">ZGL</a> demos</summary>
	<div id="cards" />
</details>
<div id="demo">
	<canvas id="c" width="640" height="360" />
</div>
<div id="buttons">
	<button title="VR" on:click={toggleVR} id="vrButton">VR</button>
	<button title="AR" on:click={toggleAR} id="arButton">AR</button>
	<button title="settings" on:click={toggleGui} id="settingButton" style="font-size: 180%;"
		>⛯</button
	>
	<a id="sourceLink" href="" target="_blank"><button title="source code">&lt;&gt;</button></a>
	<button title="fullscreen" on:click={fullscreen}>⛶</button>
</div>

<style>
	:global(body) {
		box-sizing: border-box;
		background: black;
		margin: 0px;
		color: white;
		overflow: hidden;
		font-family: 'Roboto Mono', monospace;
		user-select: none;
	}

	#panel {
		width: 200px;
		position: fixed;
		background: rgba(0, 0, 0, 0.5);
	}

	#panel summary {
		padding: 8px;
	}

	#cards {
		overflow: auto;
		height: 95vh;
	}

	:global(.card) {
		padding: 4px;
		margin: 8px;
		border: 1px solid grey;
		border-radius: 5px;
		font-size: 14px;
	}

	#panel :global(img) {
		max-width: 100%;
	}

	#demo {
		width: 100%;
		height: 100vh;
	}

	#c {
		width: 100%;
		height: 100%;
		background: black;
		touch-action: none;
	}

	:global(#gui) {
		position: fixed;
		bottom: 0px;
		right: 50px;
	}

	#buttons {
		position: fixed;
		bottom: 10px;
		right: 10px;
	}

	button {
		appearance: none;
		width: 48px;
		height: 40px;
		margin: 8px;
		font-size: 24px;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		text-align: center;
		text-decoration: none;
		display: block;
	}

	button:hover {
		background-color: rgba(80, 80, 80, 0.8);
	}

	#buttons a {
		text-decoration: none;
	}

	a {
		color: aquamarine;
	}
</style>
