<script lang="ts">
	import { getContext } from "svelte";
	import type {
		CardListSlotProps,
		KanbanInstanceApi,
	} from "@svar-ui/svelte-kanban";
	let { column, swimlane, readonly }: CardListSlotProps = $props();
	const getApi =
		getContext<() => KanbanInstanceApi | undefined>("card-list-demo-api");
	function add() {
		void getApi()?.exec("add-card", {
			card: { label: "New task", column: column.id, team: swimlane?.id },
		});
	}
</script>

<button disabled={readonly} onclick={add}>+ Add card</button>

<style>
	button {
		width: 100%;
		padding: 12px;
		cursor: pointer;
	}
</style>
