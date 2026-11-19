import pkg from "../package.json" with { type: "json" };
const version = pkg.version;

import Kanban from "./components/Kanban.svelte";
import Editor from "./components/Editor.svelte";
import CardActionMenu from "./menus/CardActionMenu.svelte";
import CardMenuButton from "./components/CardMenuButton.svelte";
import CardContextMenu from "./menus/CardContextMenu.svelte";
import ColumnActionMenu from "./menus/ColumnActionMenu.svelte";
import ColumnContextMenu from "./menus/ColumnContextMenu.svelte";
import Toolbar from "./components/Toolbar.svelte";
import Willow from "./themes/Willow.svelte";
import WillowDark from "./themes/WillowDark.svelte";
import Print from "./themes/Print.svelte";
import PrintBW from "./themes/PrintBW.svelte";

export {
	Kanban,
	Editor,
	CardActionMenu,
	CardMenuButton,
	CardContextMenu,
	ColumnActionMenu,
	ColumnContextMenu,
	/** @deprecated use `CardContextMenu` */
	CardContextMenu as ContextMenu,
	Toolbar,
	Willow,
	WillowDark,
	Print,
	PrintBW,
	version,
};

export { RestDataProvider } from "@svar-ui/kanban-provider";

export type {
	KanbanInstanceApi,
	KanbanEventHandlers,
	KanbanCard,
	RenderConfig,
	CardID,
	ColumnID,
	CardShape,
	CardShapeItem,
	CardShapeUserItem,
	CardPriorityShape,
	CardTagsShape,
	CardUsersShape,
	ColumnMenuContext,
	KanbanMenuProps,
	CardCssFn,
	CardListSlotProps,
	ColumnCssFn,
	CardProjection,
	CardProjectionTarget,
} from "./types.js";

export {
	getCardShape,
	getEditorItems,
	getPriorityOptions,
} from "./defaults.js";

export {
	getMenuOptions,
	getColumnMenuOptions,
	getToolbarItems,
	type ToolbarButtonConfig,
	type StoreActions,
	type ColumnConfig,
	type ColumnSummaryConfig,
	type ColumnSummaryResult,
	type SwimlaneID,
	type SwimlaneAccessor,
	type SwimlaneConfig,
	type SwimlaneView,
	type SwimlaneCellView,
} from "@svar-ui/kanban-store";
export { registerEditorItem } from "@svar-ui/svelte-editor";

