<script lang="ts">
	import { Loop } from '$lib/index.js';

	let k = 9;
</script>

<Loop
	f={({ z, time }) => {
		z.adjustCanvas(1);

		z({ t: time, k, FP: `1-((I.x+int(t*40.))/4^(I.y+int(t*20.))/4)%int(k)` });
	}}
></Loop>
