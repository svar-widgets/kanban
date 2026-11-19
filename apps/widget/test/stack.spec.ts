import { test, expect } from "vite-plus/test";
import { stackGroups, stackGroupKey } from "../src/layout/stack";
import { project, columns, lanes, labels } from "./helpers/stack";

test("without lanes each non-empty column is one group in declaration order", () => {
	const model = project({
		columns,
		cards: [
			{ id: "a", column: "c" },
			{ id: "b", column: 1 },
			{ id: "d", column: "c" },
		],
	});
	expect(labels(model)).toEqual([
		[1, undefined, ["b"]],
		["c", undefined, ["a", "d"]],
	]);
});

test("keys are stable and keep numeric and string IDs distinct", () => {
	expect(stackGroupKey(1)).not.toBe(stackGroupKey("1"));
	expect(stackGroupKey(1, "1")).not.toBe(stackGroupKey("1", 1));
	expect(stackGroupKey("a|b", "c")).not.toBe(stackGroupKey("a", "b|c"));
	const cards = [
		{ id: "a", column: 1, swimlane: 1 },
		{ id: "b", column: "1", swimlane: "1" },
	];
	const keys = stackGroups(project({ columns, swimlanes: lanes, cards })).map(
		g => g.key
	);
	expect(new Set(keys).size).toBe(2);
	const again = stackGroups(
		project({
			columns,
			swimlanes: lanes,
			cards: [...cards, { id: "x", column: 1, swimlane: 1 }],
		})
	).map(g => g.key);
	expect(again).toEqual(keys);
});
