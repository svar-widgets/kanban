import BasicInit from "./cases/BasicInit.svelte";
import Layout from "./cases/Layout.svelte";
import Performance from "./cases/Performance.svelte";
import SaveToBackend from "./cases/SaveToBackend.svelte";
import Filter from "./cases/Filter.svelte";
import GroupBy from "./cases/GroupBy.svelte";
import Editor from "./cases/Editor.svelte";
import CardMenu from "./cases/CardMenu.svelte";
import Tooltip from "./cases/Tooltip.svelte";
import CardPopup from "./cases/CardPopup.svelte";
import Styling from "./cases/Styling.svelte";
import Templates from "./cases/Templates.svelte";
import Locales from "./cases/Locales.svelte";
import Excel from "./cases/Excel.svelte";
import Toolbar from "./cases/Toolbar.svelte";


export const links = [
	{
		group: "",
		items: [["/base/:skin", "Basic Kanban", BasicInit, { file: "BasicInit" }]],
	},
	{
		group: "Cards",
		items: [
			["/templates/:skin", "Templates", Templates, { file: "Templates" }],
			["/styling/:skin", "Styling", Styling, { file: "Styling" }],
			[
				"/performance/:skin",
				"Performance",
				Performance,
				{ file: "Performance" },
			],
			["/layout/:skin", "Layout", Layout, { file: "Layout" }],
		],
	},
	{
		group: "Features",
		items: [
			["/filter/:skin", "Filter Cards", Filter, { file: "Filter" }],
			["/group-by/:skin", "Group Cards", GroupBy, { file: "GroupBy" }],
		],
	},
	{
		group: "Configuration",
		items: [
			["/tooltip/:skin", "Tooltip", Tooltip, { file: "Tooltip" }],
			["/card-popup/:skin", "Card Preview", CardPopup, { file: "CardPopup" }],
			["/card-menu/:skin", "Card Menu", CardMenu, { file: "CardMenu" }],
			["/editor/:skin", "Editor", Editor, { file: "Editor" }],
			["/toolbar/:skin", "Toolbar", Toolbar, { file: "Toolbar" }],
			["/locales/:skin", "Locales", Locales, { file: "Locales" }],
		],
	},
	{
		group: "Integration",
		items: [
			[
				"/save-to-backend/:skin",
				"Save to Backend",
				SaveToBackend,
				{ file: "SaveToBackend" },
			],
			["/excel/:skin", "Excel Import", Excel, { file: "Excel" }],
		],
	},
];
