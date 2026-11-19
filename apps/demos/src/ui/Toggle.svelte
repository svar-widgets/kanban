<script lang="ts">
	import { Switch } from "@svar-ui/svelte-core";

	// Switch with a clickable caption on its right.
	let {
		label,
		value = $bindable(false),
		disabled = false,
		onchange,
	}: {
		label: string;
		value?: boolean;
		disabled?: boolean;
		onchange?: (ev: { value: boolean }) => void;
	} = $props();

	const id = $props.id();
</script>

<div class="wx-demo-toggle" class:wx-disabled={disabled}>
	<Switch {id} bind:value {disabled} {onchange} />
	<label class="wx-demo-toggle-label" for={id}>{label}</label>
</div>

<style>
	.wx-demo-toggle {
		display: flex;
		align-items: center;
		gap: calc(var(--wx-padding) * 0.75);
		white-space: nowrap;
	}
	.wx-demo-toggle-label {
		cursor: pointer;
	}
	.wx-demo-toggle.wx-disabled .wx-demo-toggle-label {
		color: var(--wx-color-font-disabled);
		cursor: not-allowed;
	}
</style>
