<script lang="ts">
	// Read-only counter: "Requested columns 4".
	let { label, value }: { label: string; value: string | number } = $props();
</script>

<span class="wx-demo-stat">
	<span class="wx-demo-stat-label">{label}</span>
	<strong class="wx-demo-stat-value">{value}</strong>
</span>

<style>
	.wx-demo-stat {
		display: inline-flex;
		align-items: baseline;
		gap: calc(var(--wx-padding) * 0.5);
		white-space: nowrap;
	}
	.wx-demo-stat-label {
		color: var(--wx-color-font-alt);
	}
	.wx-demo-stat-value {
		font-weight: var(--wx-font-weight-md);
		font-variant-numeric: tabular-nums;
	}
</style>
