<script lang="ts">
	import { getContext, setContext } from "svelte";
	import type { Snippet } from "svelte";
	import { ContextMenu } from "@svar-ui/svelte-menu";
	import { getID, locale, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/kanban-locales";
	import { en as coreEn } from "@svar-ui/core-locales";
	import { getMenuOptions } from "@svar-ui/kanban-store";
	import type {
		CardID,
		KanbanCard,
		KanbanContextApi,
		KanbanInstanceApi,
	} from "../types.js";
	import { KANBAN_API_CONTEXT } from "../context.js";

	type Props = {
		options?: any[];
		api?: KanbanInstanceApi | null;
		resolver?: ((card: KanbanCard, ev: MouseEvent) => any) | null;
		filter?: ((item: any, card: KanbanCard) => boolean) | null;
		at?: string;
		children?: Snippet;
		onclick?: (e: any) => void;
		css?: string;
	};

	let {
		options = [],
		api = null,
		resolver = null,
		filter = null,
		at = "point",
		children,
		onclick,
		css,
	}: Props = $props();

	// when mounted inside <Kanban> the api context is available;
	// when wrapping <Kanban> from the outside, caller must pass `api`
	const ctxApi = getContext<KanbanContextApi | undefined>(KANBAN_API_CONTEXT);

	function parseId(id: any): CardID | null {
		if (typeof id === "string" && id.startsWith(":")) {
			const element = document.createElement("div");
			element.setAttribute("data-id", id);
			return getID(element) as CardID | null;
		}
		return typeof id === "string" || typeof id === "number" ? id : null;
	}

	function getCardById(id: any): KanbanCard | undefined {
		const cardId = parseId(id);
		if (cardId == null) return undefined;
		if (api) return api.getCards().find(c => c.id === cardId);
		return ctxApi?.getState().cards.getById(cardId);
	}

	function exec(action: string, payload: any) {
		(api ?? ctxApi)?.exec(action as any, payload);
	}

	let activeId: any = null;

	let l = getContext<ILocale | undefined>("wx-i18n");
	if (!l) {
		l = locale({ ...en, ...coreEn });
		setContext("wx-i18n", l);
	}
	const _ = l.getGroup("kanban");

	function applyLocale(opts: any[]): any[] {
		return opts.map(op => {
			op = { ...op };
			if (op.text) op.text = _(op.text);
			if (op.subtext) op.subtext = _(op.subtext);
			if (op.data) op.data = applyLocale(op.data);
			return op;
		});
	}

	function getOptions() {
		const base = options.length ? options : getMenuOptions();
		return applyLocale(base);
	}

	function itemResolver(rawId: string | number, ev: MouseEvent) {
		if (rawId == null) return null;

		const card = getCardById(rawId);
		if (!card) return null;

		if (resolver) {
			const result = resolver(card, ev);
			if (!result) return null;
		}

		activeId = card.id;
		return card;
	}

	function menuAction(ev: any) {
		const action = ev?.action;
		if (!action) return;

		const id = typeof activeId === "object" ? activeId.id : activeId;

		if (action.id === "edit-card") {
			exec("select-card", { id });
		} else if (action.id === "duplicate-card") {
			exec("duplicate-card", { id });
		} else if (action.id === "delete-card") {
			exec("delete-card", { id });
		}

		onclick?.(ev);
	}

	function filterMenu(item: any, card: KanbanCard) {
		return filter ? filter(item, card) : true;
	}

	const cOptions = $derived(getOptions());

	let menu = $state<any>();
	export function show(ev: any, obj?: any) {
		menu.show(ev, obj);
	}
</script>

<ContextMenu
	filter={filterMenu}
	options={cOptions}
	dataKey="id"
	resolver={itemResolver}
	onclick={menuAction}
	{css}
	{at}
	bind:this={menu}
/>
{#if children}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span oncontextmenu={menu?.show} data-menu-ignore="true">
		{@render children?.()}
	</span>
{/if}

<style>
	:global(.wx-menu .wx-option.wx-disabled) {
		pointer-events: none;
	}
	:global(.wx-menu .wx-option.wx-disabled .wx-value),
	:global(.wx-menu .wx-option.wx-disabled .wx-icon) {
		color: var(--wx-color-font-disabled);
	}
</style>
