type LookupItem = { id: any; label: string; [key: string]: any };

export function resolveLabel(value: any, collection?: LookupItem[]): string {
	if (collection) {
		const id = typeof value === "object" && value !== null ? value?.id : value;
		const match = collection.find(item => item.id === id);
		if (match) return match.label;
	}
	if (typeof value === "object" && value !== null) {
		return String(value.label ?? value.name ?? value.id ?? "");
	}
	return value == null ? "" : String(value);
}

export function resolveLabels(
	values: any,
	collection?: LookupItem[]
): string[] {
	if (!Array.isArray(values)) return [];
	return values.map(v => resolveLabel(v, collection));
}
