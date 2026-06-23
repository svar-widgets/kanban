<script lang="ts">
	import { getContext, setContext, type ComponentProps } from "svelte";
	import { Editor as EditorBase, registerEditorItem } from "@svar-ui/svelte-editor";
	import {
		DatePicker,
		MultiCombo,
		RichSelect,
		Slider,
	} from "@svar-ui/svelte-core";
	import { locale, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/kanban-locales";
	import { en as coreEn } from "@svar-ui/core-locales";
	import { getEditorItems } from "../defaults.js";

	registerEditorItem("richselect", RichSelect);
	registerEditorItem("multicombo", MultiCombo);
	registerEditorItem("datepicker", DatePicker);
	registerEditorItem("slider", Slider);

	type BaseEditorProps = ComponentProps<typeof EditorBase>;
	type EditorProps = Omit<BaseEditorProps, "values"> & {
		api: any;
		values?: never;
	};
	type EditorChangeEvent = Parameters<NonNullable<BaseEditorProps["onchange"]>>[0];
	type EditorSaveEvent = Parameters<NonNullable<BaseEditorProps["onsave"]>>[0];
	type EditorActionEvent = Parameters<NonNullable<BaseEditorProps["onaction"]>>[0];

	let {
		api,
		values,
		items = getEditorItems(),
		placement = "sidebar",
		layout = "default",
		focus = true,
		css = "",
		topBar,
		autoSave = true,
		onchange,
		onsave,
		onaction,
		...editorProps
	}: EditorProps = $props();
	// svelte-ignore state_referenced_locally
	void values;

	// svelte-ignore state_referenced_locally
	const { editorData } = api.getReactiveState();

	let l = getContext<ILocale | undefined>("wx-i18n");
	if (!l) {
		l = locale({ ...en, ...coreEn });
		setContext("wx-i18n", l);
	}
	const _ = l.getGroup("kanban");

	function translate(value: any) {
		return typeof value === "string" ? _(value) : value;
	}

	function applyLocale(list: any[]): any[] {
		return list.map(item => {
			const next = { ...item };
			next.label = translate(next.label);
			if (Array.isArray(next.options)) {
				next.options = next.options.map((opt: any) => ({
					...opt,
					label: translate(opt.label),
				}));
			}
			return next;
		});
	}

	const cItems = $derived(applyLocale(items));

	const defaultTopBar = {
		items: [
			{ comp: "icon", icon: "wxi-close", id: "close" },
			{ comp: "spacer" },
			{
				comp: "button",
				id: "delete",
				text: _("Delete"),
				type: "primary danger",
				onclick: handleDelete,
			},
		],
	};
	const editorTopBar = $derived(topBar === undefined ? defaultTopBar : topBar);
	const editorCss = $derived(
		["wx-editor-kanban", css].filter(Boolean).join(" ")
	);

	function handleSave(ev: EditorSaveEvent) {
		onsave?.(ev);
		const data = $editorData;
		if (!data) return;
		api.exec("update-card", { id: data.id, card: { ...ev.values } });
	}

	function handleChange(ev: EditorChangeEvent) {
		onchange?.(ev);
	}

	function handleDelete() {
		const data = $editorData;
		if (!data) return;
		api.exec("delete-card", { id: data.id });
		api.exec("select-card", { id: null });
	}

	function handleAction(ev: EditorActionEvent) {
		onaction?.(ev);
		const { item } = ev;
		if (item.id === "close" && !!item.comp) {
			api.exec("select-card", { id: null });
		}
	}
</script>

{#if $editorData}
	<EditorBase
		{...editorProps}
		{focus}
		items={cItems}
		topBar={editorTopBar}
		{autoSave}
		onchange={handleChange}
		onaction={handleAction}
		onsave={handleSave}
		{placement}
		{layout}
		values={$editorData}
		css={editorCss}
	/>
{/if}

<style>
	:global(.wx-sidearea .wx-editor-kanban) {
		width: 450px;
	}
</style>
