<!-- @component Opens on a right click anywhere on a column header. -->
<script lang="ts">
	import { getColumnMenuOptions } from "@svar-ui/kanban-store";
	import type { ColumnMenuContext, KanbanMenuProps } from "../types.js";
	import KanbanMenu from "./KanbanMenu.svelte";
	import {
		defaultColumnOptions,
		execColumnMenuAction,
		locateLane,
		resolveColumn,
	} from "./helpers.js";

	let { api = null, ...rest }: KanbanMenuProps<ColumnMenuContext> = $props();

	let menu = $state<any>();
	export function show(ev: any, obj?: any) {
		menu?.show(ev, obj);
	}
</script>

<KanbanMenu
	{...rest}
	trigger="contextmenu"
	dataKey="columnId"
	resolve={(id, ev) => resolveColumn(api, id, locateLane(ev.target as Element))}
	defaults={ctx => defaultColumnOptions(getColumnMenuOptions(), ctx)}
	builtin={(action, ctx) => execColumnMenuAction(api, action, ctx)}
	bind:this={menu}
/>
