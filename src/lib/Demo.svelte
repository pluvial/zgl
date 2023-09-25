<script>
	import { onMount } from 'svelte';
	import './demo/style.css';

	// import { DemoApp } from './demo/main.js';
	import { NeuralCA } from './demo/NeuralCA.js';
	import { DotCamera } from './demo/DotCamera.js';
	import { MeshGrid } from './demo/MeshGrid.js';
	import { ParticleLife } from './demo/ParticleLife.js';
	import { ParticleLife3d } from './demo/ParticleLife3d.js';
	import { BitField } from './demo/BitField.js';
	import { TextureSamplers } from './demo/TextureSamplers.js';
	import { GameOfLife } from './demo/GameOfLife.js';
	import { ParticleLenia } from './demo/ParticleLenia.js';
	import { FancyLenia } from './demo/FancyLenia.js';
	import { Spectrogram } from './demo/Spectrogram.js';
	import { Physarum } from './demo/Physarum.js';
	import { Physarum3d } from './demo/Physarum3d.js';
	import { SurfaceNormals } from './demo/SurfaceNormals.js';
	import { CubeDeform } from './demo/CubeDeform.js';
	import { ColorCube } from './demo/ColorCube.js';
	import { Shadowmap } from './demo/Shadowmap.js';
	import { Torus4d } from './demo/Torus4d.js';
	import { DeferredShading } from './demo/DeferredShading.js';
	import { Springs } from './demo/Springs.js';
	import { ReactionDiffusion } from './demo/ReactionDiffusion.js';

	let app;

	onMount(async () => {
		const { DemoApp } = await import('./demo/main.js');
		app = new DemoApp([
			NeuralCA,
			DotCamera,
			MeshGrid,
			ParticleLife,
			ParticleLife3d,
			BitField,
			TextureSamplers,
			GameOfLife,
			ParticleLenia,
			FancyLenia,
			Spectrogram,
			Physarum,
			Physarum3d,
			SurfaceNormals,
			CubeDeform,
			ColorCube,
			Shadowmap,
			Torus4d,
			DeferredShading,
			Springs,
			ReactionDiffusion
		]);
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

<details id="panel" open>
	<summary><a href="https://github.com/google/swissgl">SwissGL</a> demos</summary>
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
