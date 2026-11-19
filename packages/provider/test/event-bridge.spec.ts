import { afterEach, expect, test, vi } from "vite-plus/test";
import { KanbanEventBridge, RestDataProvider, CARDS } from "../src/index";

class FakeEventSource {
	static last: FakeEventSource;
	closed = false;
	listeners = new Map<string, (ev: { data: string }) => void>();
	constructor(public url: string) {
		FakeEventSource.last = this;
	}
	addEventListener(name: string, fn: (ev: { data: string }) => void) {
		this.listeners.set(name, fn);
	}
	close() {
		this.closed = true;
	}
}

afterEach(() => vi.unstubAllGlobals());

test("close() closes the underlying EventSource", () => {
	vi.stubGlobal("EventSource", FakeEventSource);
	const api = { exec: vi.fn() };
	const bridge = new KanbanEventBridge(
		"/events",
		"me",
		api as any,
		new RestDataProvider(""),
		{
			"update-card": CARDS,
		}
	);
	const es = FakeEventSource.last;
	expect(es.url).toBe("/events");

	es.listeners.get("update-card")!({
		data: JSON.stringify({
			client: "other",
			op: "update-card",
			data: { id: 1 },
		}),
	});
	expect(api.exec).toHaveBeenCalledOnce();

	bridge.close();
	expect(es.closed).toBe(true);
});

test("card events get their deadline back as a Date", () => {
	vi.stubGlobal("EventSource", FakeEventSource);
	const api = { exec: vi.fn() };
	new KanbanEventBridge("/events", "me", api as any, new RestDataProvider(""), {
		"update-card": CARDS,
	});
	FakeEventSource.last.listeners.get("update-card")!({
		data: JSON.stringify({
			client: "other",
			op: "update-card",
			data: { id: 1, card: { id: 1, deadline: "2026-06-01T00:00:00.000Z" } },
		}),
	});
	const { card } = api.exec.mock.calls[0][1];
	expect(card.deadline).toBeInstanceOf(Date);
	expect(card.deadline.toISOString()).toBe("2026-06-01T00:00:00.000Z");
});
