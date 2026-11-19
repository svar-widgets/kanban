<script lang="ts">
	import type { Snippet } from "svelte";
	import DemoToolbar from "./DemoToolbar.svelte";

	// Frame of a sample: an optional toolbar row, the widget area and an
	// optional bottom panel (event log, status line).
	let {
		toolbar,
		bottom,
		children,
	}: {
		toolbar?: Snippet;
		bottom?: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="wx-demo-page">
	{#if toolbar}<DemoToolbar>{@render toolbar()}</DemoToolbar>{/if}
	<div class="wx-demo-content">
		<div class="wx-demo-fill">{@render children()}</div>
	</div>
	{#if bottom}{@render bottom()}{/if}
</div>

<style>
	.wx-demo-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--wx-background);
	}
	.wx-demo-content {
		position: relative;
		flex: 1;
		min-height: 0;
	}
	/* absolute fill gives the widget a definite height to stretch to */
	.wx-demo-fill {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
	}
</style>
