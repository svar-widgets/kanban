<script lang="ts">
	import type { Snippet } from "svelte";

	// Related controls with an optional caption. Groups after the first are
	// separated by a divider; align="right" pushes the group to the end.
	let {
		label,
		align = "left",
		children,
	}: {
		label?: string;
		align?: "left" | "right";
		children: Snippet;
	} = $props();
</script>

<div class="wx-demo-group" class:wx-right={align === "right"}>
	{#if label}<span class="wx-demo-group-label">{label}</span>{/if}
	{@render children()}
</div>

<style>
	.wx-demo-group {
		display: flex;
		align-items: center;
		gap: var(--wx-padding);
		padding: 0 calc(var(--wx-padding) * 2);
	}
	.wx-demo-group:first-child {
		padding-left: 0;
	}
	.wx-demo-group:not(:first-child):not(.wx-right) {
		border-left: var(--wx-border);
	}
	.wx-demo-group.wx-right {
		margin-left: auto;
		padding-right: 0;
	}
	.wx-demo-group-label {
		color: var(--wx-color-font-alt);
		white-space: nowrap;
	}
</style>
