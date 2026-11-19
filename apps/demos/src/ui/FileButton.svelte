<script lang="ts">
	import type { ComponentProps, Snippet } from "svelte";
	import { Button } from "@svar-ui/svelte-core";

	// Button that opens the file picker and passes the chosen file on.
	let {
		accept,
		type,
		onfile,
		children,
	}: {
		accept?: string;
		type?: ComponentProps<typeof Button>["type"];
		onfile: (file: File) => void;
		children: Snippet;
	} = $props();

	let input = $state<HTMLInputElement>();

	function pick() {
		const file = input?.files?.[0];
		if (file) onfile(file);
		// the same file can be picked again
		if (input) input.value = "";
	}
</script>

<input
	bind:this={input}
	class="wx-demo-file"
	type="file"
	{accept}
	onchange={pick}
/>
<Button {type} onclick={() => input?.click()}>{@render children()}</Button>

<style>
	.wx-demo-file {
		display: none;
	}
</style>
