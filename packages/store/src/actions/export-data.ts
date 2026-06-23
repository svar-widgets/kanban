import type { IKanbanStore, StoreActions } from "../types";

let last: any = null;

export default async function (
	store: IKanbanStore,
	ev: StoreActions["export-data"]
) {
	const state = store.getState();
	const { viewData } = state;

	const data: Record<string, any> = {};
	const extra = (store as any).meta["export-data"] || {};
	Object.assign(data, extra);

	// switch export back to normal from export mode
	if (state.renderMode === "export" && ev.format === "inner") {
		Object.assign(data, ev.data);
		ev = last;
		last = null;

		store.setState({ renderMode: "" });
	} else if (extra.cardCss || extra.columnCss || extra.cardContent) {
		last = ev;
		store.setState({ renderMode: "export" });
		return true;
	}

	const fileName = ev.fileName || "tasks";
	const format = ev.format || "pdf";

	data.skin = ev.skin || "willow";

	const visibleData = { ...viewData };
	visibleData.columns = visibleData.columns.filter(
		column => column.cards.length > 0 && !column.collapsed
	);
	data.viewData = visibleData;

	const outData: Record<string, any> = {
		fileName,
		format,
		...ev,
		data,
	};
	delete outData.url;
	delete outData.skin;

	if (outData.paper?.styles)
		outData.paper = {
			...outData.paper,
			styles: await resolve(outData.paper.styles),
		};

	if (typeof ev.url === "string") {
		post(ev.url, {
			data: serialize(outData),
		});
	} else if (typeof ev.url === "function") {
		const records = visibleData.columns.flatMap(column => column.cards);
		ev.url(outData, records, { post, serialize });
	}

	return true;
}

const timestamp = (v: Date) =>
	new Date(v.getTime() - v.getTimezoneOffset() * 60 * 1000);

const serialize = (value: any) =>
	JSON.stringify(
		value,
		(key, value) => {
			if (value instanceof Date) return timestamp(value);
			return value;
		},
		2
	);

const post = (url: string, data: Record<string, string>) => {
	const document = (globalThis as any).document;
	if (!document) return;

	const form = document.createElement("form");
	form.method = "POST";
	form.action = url;
	form.target = "_blank";

	for (const [name, value] of Object.entries(data)) {
		const input = document.createElement("input");
		input.type = "hidden";
		input.name = name;
		input.value = value;
		form.appendChild(input);
	}

	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

const resolve = async (styles: string | string[]): Promise<string> => {
	const window = globalThis as any;

	const arr = typeof styles === "string" ? [styles] : styles;
	const out: string[] = [];
	const https: Promise<void>[] = [];

	arr.forEach((a, i) => {
		if (
			a.startsWith("http://") ||
			a.startsWith("https://") ||
			a.startsWith("/")
		) {
			https.push(
				window
					.fetch(a)
					.then((x: any) => x.text())
					.then((txt: any) => {
						out[i] = txt;
					})
			);
		} else out[i] = a;
	});

	if (!https.length) return out.join(" ");

	return await Promise.all(https).then(() => out.join(" "));
};
