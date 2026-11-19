<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban } from "@svar-ui/svelte-kanban";
	import CardTooltip from "../custom/CardTooltip.svelte";
	import { DemoPage } from "../ui";

	const { columns, cards } = getData();
</script>

<DemoPage>
	<Kanban {cards} {columns} tooltip={CardTooltip} />
</DemoPage>
