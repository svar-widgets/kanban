export function locale(initialData: any) {
	let data = initialData;
	return {
		data,

		_(key: string) {
			return data[key] || key;
		},
		__(group: string, key: string) {
			const block = data[group];
			return block ? block[key] || key : key;
		},
		getGroup(group: string) {
			return (key: string) => this.__(group, key);
		},
		extend(values: any) {
			this.data = data = { ...data, ...values };
			return this;
		},
	};
}
