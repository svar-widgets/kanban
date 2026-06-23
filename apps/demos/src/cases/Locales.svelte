<script lang="ts">
    import { onMount } from "svelte";
	import { getData } from "../data.js";
	import { Kanban, Editor, type KanbanInstanceApi } from "@svar-ui/svelte-kanban";
	import { Layout } from "@svar-ui/svelte-layout";
	import { Segmented, Locale } from "@svar-ui/svelte-core";

	import {
		en as enCore,
		cn as cnCore,
		de as deCore,
		es as esCore,
		fr as frCore,
		it as itCore,
		ja as jaCore,
		pt as ptCore,
		ru as ruCore,
	} from "@svar-ui/core-locales";
	import {
		en,
		cn,
		de,
		es,
		fr,
		it,
		jp,
		pt,
		ru,
	} from "@svar-ui/kanban-locales";

	let api = $state<KanbanInstanceApi>();
	const { columns, cards } = getData();

	const dictionaries: Record<string, { kanban: any; core: any }> = {
		en: { kanban: en, core: enCore },
		cn: { kanban: cn, core: cnCore },
		de: { kanban: de, core: deCore },
		es: { kanban: es, core: esCore },
		fr: { kanban: fr, core: frCore },
		it: { kanban: it, core: itCore },
		jp: { kanban: jp, core: jaCore },
		pt: { kanban: pt, core: ptCore },
		ru: { kanban: ru, core: ruCore },
	};

	let locale = $state("en");
	let words = $derived({
		...dictionaries[locale].kanban,
		...dictionaries[locale].core,
	});

	// Demo-only column-label translations. Column labels are user data and not
	// part of the widget's i18n surface — translating them here just makes the
	// language switch more obvious on the board itself.
	const columnLabels: Record<string, Record<string, string>> = {
		en: { todo: "To Do", doing: "In Progress", done: "Done" },
		ru: { todo: "К выполнению", doing: "В работе", done: "Готово" },
		de: { todo: "Zu erledigen", doing: "In Arbeit", done: "Erledigt" },
		fr: { todo: "À faire", doing: "En cours", done: "Terminé" },
		es: { todo: "Por hacer", doing: "En curso", done: "Hecho" },
		it: { todo: "Da fare", doing: "In corso", done: "Fatto" },
		pt: { todo: "A fazer", doing: "Em andamento", done: "Concluído" },
		jp: { todo: "未着手", doing: "進行中", done: "完了" },
		cn: { todo: "待办", doing: "进行中", done: "已完成" },
	};

	let localizedColumns = $derived(
		columns.map(col => ({
			...col,
			label: columnLabels[locale]?.[col.id as string] ?? col.label,
		}))
	);

	const options = [
		{ id: "en", label: "English" },
		{ id: "cn", label: "Chinese" },
		{ id: "de", label: "German" },
		{ id: "es", label: "Spanish" },
		{ id: "fr", label: "French" },
		{ id: "it", label: "Italian" },
		{ id: "jp", label: "Japanese" },
		{ id: "pt", label: "Portuguese" },
		{ id: "ru", label: "Russian" },
	];

	function setLocale(l: string) {
		locale = l;
		setTimeout(() => {
			api?.exec("select-card", { id: 1 })
		}, 250)
	}

	onMount(() => {
		setTimeout(() => {
			api?.exec("select-card", { id: 1 })
		}, 250)
	})
</script>

<Layout direction="column">
	<Segmented {options} value={locale} onchange={v => setLocale(v.value as string)} />
	{#key locale}
		<Locale {words}>
			<Kanban
				init={(v) => api = v}
				{cards}
				columns={localizedColumns}
				card={{ menu: true }}
			/>
			{#if api}<Editor {api} />{/if}
		</Locale>
	{/key}
</Layout>
