<script lang="ts" generics="T">
	import { getContext } from "svelte";
	import { ActionMenu, ContextMenu } from "@svar-ui/svelte-menu";
	import { locale, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/kanban-locales";
	import { en as coreEn } from "@svar-ui/core-locales";
	import type { KanbanMenuProps } from "../types.js";
	import { localizeOptions } from "./helpers.js";

	type Props = Omit<KanbanMenuProps<T>, "api"> & {
		/** `click` - ActionMenu, `contextmenu` - ContextMenu. */
		trigger: "click" | "contextmenu";
		/** Attribute (camelCase) carrying the target id, e.g. `columnMenu`. */
		dataKey: string;
		resolve: (id: any, ev: MouseEvent) => T | null;
		defaults: (ctx: T) => any[];
		builtin: (action: any, ctx: T) => void;
	};

	let {
		options,
		resolver = null,
		filter = null,
		onclick,
		at = "point",
		css = "",
		children,
		trigger,
		dataKey,
		resolve,
		defaults,
		builtin,
	}: Props = $props();

	// the menu wraps <Kanban> from the outside, so the kanban locale is not in
	// context unless the host provides one
	const _ = (
		getContext<ILocale | undefined>("wx-i18n") ?? locale({ ...en, ...coreEn })
	).getGroup("kanban");

	// Items are resolved when the menu opens: the inner menu calls the resolver
	// before it renders, so they can follow the target's current state.
	let current = $state<any[]>([]);
	let active: T | null = null;

	function itemResolver(id: any, ev: MouseEvent) {
		const ctx = resolve(id, ev);
		if (!ctx) return null;
		if (resolver && !resolver(ctx, ev)) return null;

		const base =
			typeof options === "function" ? options(ctx) : (options ?? defaults(ctx));
		if (!base || !base.length) return null;

		current = localizeOptions(base, _);
		active = ctx;
		return ctx;
	}

	function menuAction(ev: any) {
		// closing without a choice (outside click, Escape) comes with no action
		if (!ev?.action || !active) return;
		builtin(ev.action, active);
		onclick?.(ev);
	}

	function filterMenu(item: any, ctx: T) {
		return filter ? filter(item, ctx) : true;
	}

	let menu = $state<any>();
	export function show(ev: any, obj?: any) {
		menu?.show(ev, obj);
	}

	const Menu = $derived(trigger === "click" ? ActionMenu : ContextMenu);
</script>

<Menu
	options={current}
	resolver={itemResolver}
	filter={filterMenu}
	onclick={menuAction}
	{dataKey}
	{at}
	{css}
	bind:this={menu}
>
	{@render children?.()}
</Menu>

<style>
	:global(.wx-menu .wx-option.wx-disabled) {
		pointer-events: none;
	}
	:global(.wx-menu .wx-option.wx-disabled .wx-value),
	:global(.wx-menu .wx-option.wx-disabled .wx-icon) {
		color: var(--wx-color-font-disabled);
	}
</style>
