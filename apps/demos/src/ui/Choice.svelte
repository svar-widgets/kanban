<script lang="ts">
	import { Segmented } from "@svar-ui/svelte-core";

	// One-of-few switch (view mode, size, locale).
	let {
		options,
		value = $bindable(),
		onchange,
	}: {
		options: {
			id: string | number;
			label: string;
			icon?: string;
			title?: string;
		}[];
		value?: string | number;
		onchange?: (ev: { value: string | number }) => void;
	} = $props();
</script>

<Segmented {options} bind:value {onchange} css="wx-demo-choice" />
