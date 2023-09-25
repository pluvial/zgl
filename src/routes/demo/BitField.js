/** @license
 * Copyright 2023 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

// Bit Field texture, inspired by the tweet thread:
// https://twitter.com/aemkei/status/1378106731386040322
export default class BitField {
	static Tags = ['2d'];
	constructor(z, gui) {
		this.k = 9;
		gui.add(this, 'k', 2, 50, 1);
	}
	frame(z, { time }) {
		const { k } = this;
		z({ t: time, k, FP: `1-((I.x+int(t*40.))/4^(I.y+int(t*20.))/4)%int(k)` });
	}
}
