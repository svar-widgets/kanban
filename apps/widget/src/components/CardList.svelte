<script lang="ts">
	import type { ComponentProps } from "svelte";
	import StackCardList from "./StackCardList.svelte";

	const FlowCardList = StackCardList; // pro feature
	let props: ComponentProps<typeof StackCardList> = $props();
</script>

{#if props.column.cardWidth !== undefined}
	<FlowCardList {...props} />
{:else}
	<StackCardList {...props} />
{/if}
