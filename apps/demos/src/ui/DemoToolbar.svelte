<script lang="ts">
	import type { Snippet } from "svelte";

	// A row of ToolbarGroup blocks. Groups line up on the left; one group
	// may use align="right" to sit at the far end.
	let { children }: { children: Snippet } = $props();
</script>

<div class="wx-demo-toolbar">{@render children()}</div>

<style>
	.wx-demo-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: calc(var(--wx-padding) * 1.5) 0;
		padding: var(--wx-padding) calc(var(--wx-padding) * 2);
		border-bottom: var(--wx-border);
		background: var(--wx-background);
	}
</style>
