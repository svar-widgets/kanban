// The locale packages ship plain JS; each export is a dictionary of words.
declare module "@svar-ui/core-locales" {
	type Words = Record<string, any>;
	export const en: Words,
		cn: Words,
		de: Words,
		es: Words,
		fr: Words,
		it: Words,
		ja: Words,
		pt: Words,
		ru: Words;
}

declare module "@svar-ui/kanban-locales" {
	type Words = Record<string, any>;
	export const en: Words,
		cn: Words,
		de: Words,
		es: Words,
		fr: Words,
		it: Words,
		jp: Words,
		pt: Words,
		ru: Words;
}
