<script lang="ts">
	import { onDestroy } from "svelte";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi, KanbanCard } from "@svar-ui/svelte-kanban";
	import {
		RestDataProvider,
		CARDS,
		KanbanEventBridge,
	} from "@svar-ui/kanban-provider";
	import { getData } from "../data.js";
	import { DemoPage, Message, Button } from "../ui";

	const { columns } = getData();
	// a hosted board server shared by every open tab
	const server = "https://kanban-users-backend.svar.dev";
	const storageKey = "kanban-multiuser-board";
	// unique per tab, so a client skips the echo of its own changes; not auth
	const clientId = crypto.randomUUID();

	type Board = { id: string; provider: RestDataProvider; cards: KanbanCard[] };
	let board = $state.raw<Board | null>(null);
	let api = $state<KanbanInstanceApi>();
	let bridge: KanbanEventBridge | null = null;

	function closeBridge() {
		bridge?.close();
		bridge = null;
	}
	onDestroy(closeBridge);

	async function open(id: string) {
		const provider = new RestDataProvider(`${server}/boards/${id}`);
		provider.setHeaders({ "X-Client-Id": clientId });
		try {
			const cards = await provider.getData();
			if (!Array.isArray(cards)) throw new Error("Invalid board data");
			store(id);
			board = { id, provider, cards };
		} catch {
			// the board is gone or the server is unreachable: start over
			store(null);
			board = null;
		}
	}

	async function create() {
		const response = await fetch(`${server}/boards`, { method: "POST" });
		const { id }: { id: string } = await response.json();
		await open(id);
	}

	function init(value: KanbanInstanceApi) {
		if (!board) return;
		api = value;
		// changes made in other tabs arrive through the event stream
		closeBridge();
		bridge = new KanbanEventBridge(
			`${server}/boards/${board.id}/events`,
			clientId,
			value,
			board.provider,
			{
				"update-card": CARDS,
				"add-card": CARDS,
				"delete-card": CARDS,
				"move-card": CARDS,
			}
		);
		value.setNext(board.provider);
	}

	// used to store the board id in localStorage
	function store(id: string | null) {
		try {
			if (id) localStorage.setItem(storageKey, id);
			else localStorage.removeItem(storageKey);
		} catch {
			// the board still works, it is just not reused on reload
		}
	}
	function stored() {
		try {
			return localStorage.getItem(storageKey);
		} catch {
			return null;
		}
	}

	const saved = stored();
	if (saved) void open(saved);
</script>

<DemoPage>
	{#if board}
		<Kanban {init} cards={board.cards} {columns} />
		{#if api}<Editor {api} />{/if}
	{:else}
		<Message
			icon="wxi-plus"
			title="No board yet"
			text="Create a shared board and open this page in another tab to see changes sync between clients in real time."
		>
			<Button type="primary" icon="wxi-plus" onclick={create}>
				Create board
			</Button>
		</Message>
	{/if}
</DemoPage>
