import { mount } from "svelte";
import type { ExportConfig } from "@svar-ui/kanban-store";
import Export from "./export/Kanban.svelte";

function init(
	target: string,
	config: ExportConfig,
	skin: string,
	htmlMode: boolean
) {
	mount(Export, {
		target: target
			? (document.querySelector(target) as HTMLElement)
			: document.body,
		props: {
			config,
			skin,
			htmlMode,
		},
	});
}

export { init };
