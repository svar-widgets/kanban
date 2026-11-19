<script lang="ts">
	import { getData } from "../data.js";
	import { Kanban, Editor } from "@svar-ui/svelte-kanban";
	import type { KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { DemoPage, ToolbarGroup, Choice } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	const options = [
		{ id: "auto", label: "Auto" },
		{ id: "mobile", label: "Mobile" },
		{ id: "desktop", label: "Desktop" },
	];
	let size = $state<string | number>("auto");

	// the widget never detects the viewport: the host owns the breakpoint
	let narrow = $state(false);
	$effect(() => {
		const mq = window.matchMedia("(max-width: 640px)");
		const sync = () => (narrow = mq.matches);
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	});

	// mobile gets the stacked layout and an editor over the whole widget
	const mobile = $derived(size === "mobile" || (size === "auto" && narrow));
</script>

<DemoPage>
	{#snippet toolbar()}
		<ToolbarGroup label="Screen">
			<Choice {options} bind:value={size} />
		</ToolbarGroup>
	{/snippet}
	<div class="frame" class:phone={size === "mobile"}>
		<Kanban
			bind:this={api}
			{cards}
			{columns}
			render={{ layout: mobile ? "stack" : "board" }}
		/>
		{#if api}
			<Editor {api} placement={mobile ? "fullscreen" : "sidebar"} />
		{/if}
	</div>
</DemoPage>

<style>
	.frame {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	/* a phone-sized frame when Mobile is forced on a wide screen */
	.phone {
		max-width: 480px;
		margin: 10px;
		border: var(--wx-border);
		border-width: 16px;
		border-radius: 16px;
		box-sizing: border-box;
	}
</style>
