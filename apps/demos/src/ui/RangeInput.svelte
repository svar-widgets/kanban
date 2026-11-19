<script lang="ts">
	import { Slider } from "@svar-ui/svelte-core";

	// Slider with an inline caption and the current value.
	let {
		label,
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		width = "160px",
		onchange,
	}: {
		label: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		width?: string;
		onchange?: (ev: { value: number }) => void;
	} = $props();
</script>

<div class="wx-demo-range">
	<span class="wx-demo-range-label">{label}</span>
	<Slider bind:value {min} {max} {step} {width} {onchange} />
	<span class="wx-demo-range-value">{value}</span>
</div>

<style>
	.wx-demo-range {
		display: flex;
		align-items: center;
		gap: var(--wx-padding);
		white-space: nowrap;
	}
	.wx-demo-range-value {
		min-width: 6ch;
		font-variant-numeric: tabular-nums;
	}
</style>
