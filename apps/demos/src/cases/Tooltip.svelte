<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban } from "@svar-ui/svelte-kanban";
	import CardTooltip from "../custom/CardTooltip.svelte";

	const { columns, cards } = getData();
</script>

<Kanban {cards} {columns} tooltip={CardTooltip} />
