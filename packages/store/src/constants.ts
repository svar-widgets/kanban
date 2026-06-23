export function getMenuOptions() {
	return [
		{ id: "edit-card", text: "Edit card", icon: "wxi-edit" },
		{ id: "duplicate-card", text: "Duplicate card", icon: "wxi-content-copy" },
		{ id: "delete-card", text: "Delete card", icon: "wxi-delete" },
	];
}

export type ToolbarButtonConfig = {
	add?: boolean;
	undo?: boolean;
	sort?: boolean;
};

export function getToolbarItems(config?: ToolbarButtonConfig) {
	const items: any[] = [];
	if (config?.add) {
		items.push({
			id: "add-card",
			comp: "button",
			icon: "wxi-plus",
			type: "primary",
		});
		items.push({ comp: "separator" });
	}

	if (config?.undo) {
		items.push(
			{
				id: "undo",
				comp: "icon",
				icon: "wxi-undo",
				title: "Undo",
				menuText: "Undo",
			},
			{
				id: "redo",
				comp: "icon",
				icon: "wxi-redo",
				title: "Redo",
				menuText: "Redo",
			}
		);
	}

	if (config?.sort) {
		items.push({
			text: "Sort",
			title: "Sort",
			icon: "wxi-sort",
			collapsed: true,
			layout: "column",
			items: [
				{
					id: "sort-label-asc",
					comp: "item",
					icon: "wxi-asc",
					text: "Title A-Z",
				},
				{
					id: "sort-label-desc",
					comp: "item",
					icon: "wxi-desc",
					text: "Title Z-A",
				},
				{
					id: "sort-priority-asc",
					comp: "item",
					icon: "wxi-asc",
					text: "Priority Low-High",
				},
				{
					id: "sort-priority-desc",
					comp: "item",
					icon: "wxi-desc",
					text: "Priority High-Low",
				},
				{ comp: "separator" },
				{ id: "sort-clear", comp: "item", text: "Clear sorting" },
			],
		});
	}

	return items;
}
