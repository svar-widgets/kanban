<script lang="ts">
	import { Select } from "@svar-ui/svelte-core";

	// One-of-many dropdown with a fixed width, so toolbars do not jump.
	let {
		options,
		value = $bindable(),
		width = "180px",
		placeholder,
		onchange,
	}: {
		options: { id: string | number; label: string }[];
		value?: string | number;
		width?: string;
		placeholder?: string;
		onchange?: (ev: { value: string | number }) => void;
	} = $props();
</script>

<div class="wx-demo-select" style:--wx-input-width={width}>
	<Select {options} bind:value {placeholder} {onchange} />
</div>

<style>
	.wx-demo-select {
		width: var(--wx-input-width);
	}
</style>
