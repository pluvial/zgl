// export function updateObject(o: Record<string, any>, updates: Record<string, any>) {
export function updateObject<T extends Record<string, any>>(o: T, updates: Partial<T>) {
	for (const s in updates) {
		o[s] = updates[s]!;
	}
	return o;
}
