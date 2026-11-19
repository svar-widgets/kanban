<script lang="ts">
	import { getData } from "../data.js";
	import {
		Kanban,
		Editor,
		CardActionMenu,
		type KanbanInstanceApi,
	} from "@svar-ui/svelte-kanban";
	import { Locale } from "@svar-ui/svelte-core";
	import * as core from "@svar-ui/core-locales";
	import * as kanban from "@svar-ui/kanban-locales";
	import { DemoPage, Choice } from "../ui";

	const { columns, cards } = getData();
	let api = $state<KanbanInstanceApi>();

	// language id -> kanban and core dictionaries
	const languages = [
		{ id: "en", label: "English", kanban: kanban.en, core: core.en },
		{ id: "cn", label: "Chinese", kanban: kanban.cn, core: core.cn },
		{ id: "de", label: "German", kanban: kanban.de, core: core.de },
		{ id: "es", label: "Spanish", kanban: kanban.es, core: core.es },
		{ id: "fr", label: "French", kanban: kanban.fr, core: core.fr },
		{ id: "it", label: "Italian", kanban: kanban.it, core: core.it },
		{ id: "jp", label: "Japanese", kanban: kanban.jp, core: core.ja },
		{ id: "pt", label: "Portuguese", kanban: kanban.pt, core: core.pt },
		{ id: "ru", label: "Russian", kanban: kanban.ru, core: core.ru },
	];
	const options = languages.map(({ id, label }) => ({ id, label }));

	let lang = $state<string | number>("en");
	const words = $derived.by(() => {
		const l = languages.find(l => l.id === lang) ?? languages[0];
		return { ...l.kanban, ...l.core };
	});

	// Column labels are user data, not part of the widget's i18n; they are
	// translated here only to make the switch visible on the board.
	const columnLabels: Record<string, Record<string, string>> = {
		ru: { todo: "К выполнению", doing: "В работе", done: "Готово" },
		de: { todo: "Zu erledigen", doing: "In Arbeit", done: "Erledigt" },
		fr: { todo: "À faire", doing: "En cours", done: "Terminé" },
		es: { todo: "Por hacer", doing: "En curso", done: "Hecho" },
		it: { todo: "Da fare", doing: "In corso", done: "Fatto" },
		pt: { todo: "A fazer", doing: "Em andamento", done: "Concluído" },
		jp: { todo: "未着手", doing: "進行中", done: "完了" },
		cn: { todo: "待办", doing: "进行中", done: "已完成" },
	};
	const localizedColumns = $derived(
		columns.map(c => ({
			...c,
			label: columnLabels[lang]?.[c.id] ?? c.label,
		}))
	);

	// the open editor shows most of the translated words
	function init(value: KanbanInstanceApi) {
		api = value;
		value.exec("select-card", { id: 1 });
	}
</script>

<DemoPage>
	{#snippet toolbar()}
		<Choice {options} bind:value={lang} />
	{/snippet}
	{#key lang}
		<Locale {words}>
			<CardActionMenu {api}>
				<Kanban
					{init}
					{cards}
					columns={localizedColumns}
					card={{ menu: true }}
				/>
			</CardActionMenu>
			{#if api}<Editor {api} />{/if}
		</Locale>
	{/key}
</DemoPage>
