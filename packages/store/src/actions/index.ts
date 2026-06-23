import type { EventBus } from "@svar-ui/lib-state";
import type { StoreActions, IKanbanStore } from "../types";

import addCard from "./add-card";
import updateCard from "./update-card";
import moveCard from "./move-card";
import duplicateCard from "./duplicate-card";
import deleteCard from "./delete-card";

import selectCard from "./select-card";
import updateColumn from "./update-column";

import filterCards from "./filter-cards";
import setSort from "./sort-cards";
import provideData from "./provide-data";


export function init(
	inBus: EventBus<StoreActions, keyof StoreActions>,
	store: IKanbanStore
) {

	inBus.on("add-card", (params: any) => addCard(store, params));
	inBus.on("update-card", (params: any) => updateCard(store, params));
	inBus.on("move-card", (params: any) => moveCard(store, params));
	inBus.on("duplicate-card", (params: any) => duplicateCard(store, params));
	inBus.on("delete-card", (params: any) => deleteCard(store, params));
	inBus.on("select-card", (params: any) => selectCard(store, params));
	inBus.on("update-column", (params: any) => updateColumn(store, params));
	inBus.on("filter-cards", (params: any) => filterCards(store, params));
	inBus.on("sort-cards", (params: any) => setSort(store, params));
	inBus.on("provide-data", (params: any) => provideData(store, params));
}
