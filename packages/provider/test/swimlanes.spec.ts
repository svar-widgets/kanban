import { test, expect, vi } from "vite-plus/test";
import { tempID } from "@svar-ui/lib-state";
import { RestDataProvider, CARDS } from "../src/index";

test("queued two-axis moves reconcile temporary card IDs without changing lane IDs", async () => {
	const requests: { url: string; data: any }[] = [];
	vi.stubGlobal("fetch", async (url: string, options: RequestInit) => {
		const data = JSON.parse(options.body as string);
		requests.push({ url, data });
		return { json: async () => ({ id: 42 }) };
	});
	try {
		const provider = new RestDataProvider("https://example.invalid");
		const id = tempID();
		const add = provider.exec("add-card", {
			id,
			card: { label: "New", team: 0 },
		});
		const move = provider.exec("move-card", {
			id,
			column: "done",
			swimlane: 1,
			before: null,
		});
		await Promise.all([add, move]);
		expect(requests).toHaveLength(2);
		expect(requests[1]).toMatchObject({
			url: "https://example.invalid/cards/42/move",
			data: { id: 42, column: "done", swimlane: 1, before: null },
		});
		expect(provider.getQueue().resolve(42, CARDS)).toBe(id);
	} finally {
		vi.unstubAllGlobals();
	}
});

test("add-card sends its anchor, waiting for a pending card's backend ID", async () => {
	const requests: any[] = [];
	let release!: () => void;
	const pending = new Promise<void>(resolve => {
		release = resolve;
	});
	vi.stubGlobal("fetch", async (_url: string, options: RequestInit) => {
		const data = JSON.parse(options.body as string);
		requests.push(data);
		if (data.label === "First") await pending;
		return { json: async () => ({ id: data.label === "First" ? 42 : 43 }) };
	});
	try {
		const provider = new RestDataProvider("https://example.invalid");
		const first = tempID();
		const added = provider.exec("add-card", {
			id: first,
			card: { label: "First" },
			before: null,
		});
		const second = provider.exec("add-card", {
			id: tempID(),
			card: { label: "Second" },
			before: first,
		});
		expect(requests).toHaveLength(1);
		release();
		await Promise.all([added, second]);
		expect(requests).toEqual([
			{ label: "First", before: null },
			{ label: "Second", before: 42 },
		]);
	} finally {
		release();
		vi.unstubAllGlobals();
	}
});
