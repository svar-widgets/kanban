import type { Plugin } from "vite-plus";

export interface StripBlocksOptions {
	strip?: boolean;
	startMarker?: string;
	endMarker?: string;
	mitMarker?: string;
}

export function stripBlocks(options?: StripBlocksOptions): Plugin;
