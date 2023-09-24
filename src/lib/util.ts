export function updateObject<T extends Record<string, any>>(o: T, updates: T) {
	for (const s in updates) {
		o[s] = updates[s];
	}
	return o;
}
