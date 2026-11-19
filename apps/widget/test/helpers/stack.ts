import { writable } from "svelte/store";
import {
	KanbanStore,
	type KanbanModel,
	type StateInput,
} from "../../../../packages/store/src/index";
import { stackGroups } from "../../src/layout/stack";

export function project(input: Partial<StateInput>): KanbanModel {
	const store = new KanbanStore(writable);
	store.init({ cards: [], columns: [], ...input } as StateInput);
	return store.getState().viewData;
}

export const columns = [
	{ id: 1, label: "One" },
	{ id: "1", label: "String one" },
	{ id: "c", label: "C" },
];
export const lanes = [
	{ id: 1, label: "Numeric lane" },
	{ id: "1", label: "String lane" },
];

export const labels = (model: KanbanModel) =>
	stackGroups(model).map(g => [
		g.column.id,
		g.swimlane?.id,
		g.cards.map(c => c.id),
	]);
