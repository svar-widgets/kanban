<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban } from "@svar-ui/svelte-kanban";
	import CardPopup from "../custom/CardPopup.svelte";
	import { DemoPage } from "../ui";

	const { columns, cards } = getData();
</script>

<DemoPage>
	<Kanban {cards} {columns} cardPopup={CardPopup} />
</DemoPage>
