<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban } from "@svar-ui/svelte-kanban";
	import CardPopup from "../custom/CardPopup.svelte";

	const { columns, cards } = getData();
</script>

<Kanban {cards} {columns} cardPopup={CardPopup} />
