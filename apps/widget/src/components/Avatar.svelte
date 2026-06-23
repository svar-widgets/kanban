<script lang="ts">
	import type { CardID } from "@svar-ui/kanban-store";

	type AvatarUser = {
		id: CardID;
		label?: string;
		name?: string;
		img?: string;
		avatar?: string;
		css?: string;
	};

	type Props = {
		value?: AvatarUser | AvatarUser[] | null;
		size?: number;
		limit?: number;
	};

	let { value, size = 24, limit }: Props = $props();

	const users = $derived(
		Array.isArray(value) ? value : value ? [value] : []
	);
	const safeLimit = $derived(
		typeof limit === "number" && Number.isFinite(limit)
			? Math.max(0, Math.floor(limit))
			: users.length
	);
	const visibleUsers = $derived(users.slice(0, safeLimit));
	const overflowCount = $derived(
		Math.max(0, users.length - visibleUsers.length)
	);
	const fontSize = $derived(Math.max(10, Math.round(size * 0.42)));
	const stackStyle = $derived(
		`--wx-avatar-size:${size}px;--wx-avatar-font-size:${fontSize}px;`
	);

	function getLabel(user: AvatarUser): string {
		return user.label ?? user.name ?? "" as string;
	}

	function getInitials(user: AvatarUser): string {
		const label = getLabel(user).trim();
		if (!label) return "";
		const words = label.split(/\s+/);
		return (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase().slice(0, 2);
	}

	function getImage(user: AvatarUser): string | undefined {
		return user.img ?? user.avatar;
	}
</script>

{#if users.length > 0}
	<div class="wx-avatars" style={stackStyle}>
		{#each visibleUsers as user (user.id)}
			{@const label = getLabel(user)}
			{@const image = getImage(user)}
			<span
				class="wx-avatar {user.css ?? ''}"
				title={label || undefined}
				aria-label={label || undefined}
			>
				{#if image}
					<img class="wx-image" src={image} alt="" loading="lazy" />
				{:else}
					{getInitials(user)}
				{/if}
			</span>
		{/each}
		{#if overflowCount > 0}
			<span class="wx-avatar wx-more">+{overflowCount}</span>
		{/if}
	</div>
{/if}

<style>
	.wx-avatars {
		display: inline-flex;
		align-items: center;
		min-width: 0;
	}

	.wx-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--wx-avatar-size);
		height: var(--wx-avatar-size);
		margin-left: calc(var(--wx-avatar-size) * -0.25);
		border: 2px solid var(--wx-kanban-card-bg);
		border-radius: 50%;
		background: var(--wx-kanban-avatar-bg);
		color: var(--wx-color-font);
		font-size: var(--wx-avatar-font-size);
		font-weight: var(--wx-font-weight-md);
		line-height: 1;
		overflow: hidden;
		text-transform: uppercase;
		user-select: none;
	}

	.wx-avatar:first-child {
		margin-left: 0;
	}

	.wx-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.wx-more {
		font-size: calc(var(--wx-avatar-font-size) * 0.85);
		text-transform: none;
	}
</style>
