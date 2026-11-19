<script lang="ts">
	import type { Snippet } from "svelte";

	// Muted one-line explanation next to the controls.
	let { children }: { children: Snippet } = $props();
</script>

<span class="wx-demo-hint">{@render children()}</span>

<style>
	.wx-demo-hint {
		color: var(--wx-color-font-alt);
	}
</style>
