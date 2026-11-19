import { test, expect, vi } from "vite-plus/test";
import { tempID } from "@svar-ui/lib-state";
import { RestDataProvider, COLUMNS, SWIMLANES } from "../src/index";

for (const axis of ["column", "swimlane"] as const) {
	test(`${axis} persistence carries config and anchors and reconciles IDs`, async () => {
		const requests: { url: string; method: string; data: any }[] = [];
		vi.stubGlobal("fetch", async (url: string, options: RequestInit) => {
			requests.push({
				url,
				method: options.method!,
				data: options.body ? JSON.parse(options.body as string) : undefined,
			});
			return { json: async () => ({ id: 42 }) };
		});
		try {
			const provider = new RestDataProvider("https://example.invalid");
			const id = tempID();
			const exec = (action: string, data: any) =>
				provider.exec(action as any, data);
			const add = exec(`add-${axis}`, {
				id,
				[axis]: { id, label: "New", metadata: { test: true } },
				before: "anchor",
			});
			const move = exec(`move-${axis}`, { id, before: null });
			await Promise.all([add, move]);
			await exec(`update-${axis}`, { id, [axis]: { label: "Renamed" } });
			await exec(`delete-${axis}`, { id });
			expect(requests).toEqual([
				{
					url: `https://example.invalid/${axis}s`,
					method: "POST",
					data: {
						id,
						label: "New",
						metadata: { test: true },
						before: "anchor",
					},
				},
				{
					url: `https://example.invalid/${axis}s/42/move`,
					method: "PUT",
					data: { before: null },
				},
				{
					url: `https://example.invalid/${axis}s/42`,
					method: "PUT",
					data: { label: "Renamed" },
				},
				{
					url: `https://example.invalid/${axis}s/42`,
					method: "DELETE",
					data: undefined,
				},
			]);
			expect(
				provider.getQueue().resolve(42, axis === "column" ? COLUMNS : SWIMLANES)
			).toBe(id);
		} finally {
			vi.unstubAllGlobals();
		}
	});
}

test("inserting before a pending group waits for its backend anchor ID", async () => {
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
		const added = provider.exec("add-column", {
			id: first,
			column: { label: "First" },
		});
		const second = provider.exec("add-column", {
			id: tempID(),
			column: { label: "Second" },
			before: first,
		});
		expect(requests).toHaveLength(1);
		release();
		await Promise.all([added, second]);
		expect(requests[1]).toEqual({ label: "Second", before: 42 });
	} finally {
		release();
		vi.unstubAllGlobals();
	}
});
