export function updateObject(o, updates) {
	for (const s in updates) {
		o[s] = updates[s];
	}
	return o;
}
