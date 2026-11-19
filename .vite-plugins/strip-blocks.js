export function stripBlocks(options = {}) {
	const {
		strip = true,
		startMarker = "//<pro>",
		endMarker = "//</pro>",
		// `//<mit>code` lines are comments in Pro and become `code` in MIT
		mitMarker = "//<mit>",
	} = options;

	const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const blockRe = new RegExp(
		`^[ \\t]*${esc(startMarker)}[ \\t]*\\r?\\n[\\s\\S]*?^[ \\t]*${esc(endMarker)}[ \\t]*\\r?\\n?`,
		"gm"
	);
	const mitRe = new RegExp(`^([ \\t]*)${esc(mitMarker)}`, "gm");

	return {
		name: "strip-blocks",
		enforce: "pre",
		transform: {
			filter: {
				code: new RegExp(`${esc(startMarker)}|${esc(mitMarker)}`),
			},
			handler(code, _id) {
				if (!strip) return null;
				const transformed = code.replace(blockRe, "").replace(mitRe, "$1");
				if (transformed === code) return null;
				return { code: transformed, map: null };
			},
		},
	};
}
