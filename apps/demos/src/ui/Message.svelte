<script lang="ts">
	import type { Snippet } from "svelte";

	// Centered box for states that replace the widget: empty board,
	// server not reachable. Actions go into children.
	let {
		title,
		text,
		icon = "wxi-alert",
		type = "info",
		children,
	}: {
		title: string;
		text?: string;
		icon?: string;
		type?: "info" | "danger";
		children?: Snippet;
	} = $props();
</script>

<div class="wx-demo-message">
	<div class="wx-demo-message-box">
		<div class="wx-demo-message-icon wx-{type}"><i class={icon}></i></div>
		<div class="wx-demo-message-title">{title}</div>
		{#if text}<p class="wx-demo-message-text">{text}</p>{/if}
		{#if children}
			<div class="wx-demo-message-actions">{@render children()}</div>
		{/if}
	</div>
</div>

<style>
	.wx-demo-message {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: calc(var(--wx-padding) * 3);
		background: var(--wx-background-alt);
	}
	.wx-demo-message-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 380px;
		padding: calc(var(--wx-padding) * 4);
		text-align: center;
		border: var(--wx-border);
		border-radius: var(--wx-radius-major);
		background: var(--wx-background);
		box-shadow: var(--wx-shadow-light);
	}
	.wx-demo-message-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		margin-bottom: calc(var(--wx-padding) * 2);
		border-radius: 50%;
		font-size: 24px;
		color: var(--wx-color-primary-font);
		background: var(--wx-color-primary);
	}
	.wx-demo-message-icon.wx-danger {
		background: var(--wx-color-danger);
	}
	.wx-demo-message-title {
		font-size: var(--wx-font-size-hd);
		line-height: var(--wx-line-height-hd);
		font-weight: var(--wx-font-weight-md);
	}
	.wx-demo-message-text {
		margin: var(--wx-padding) 0 0;
		color: var(--wx-color-font-alt);
	}
	.wx-demo-message-actions {
		display: flex;
		gap: var(--wx-padding);
		margin-top: calc(var(--wx-padding) * 3);
	}
</style>
