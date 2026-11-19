import { getContext } from "svelte";

type Helpers = {
	showNotice: (msg: { text: string; type?: string; expire?: number }) => void;
	showModal: (msg: { title?: string; message?: string }) => Promise<unknown>;
};

export type NoticeType = "info" | "success" | "warning" | "danger";

// Notices and confirmations for samples. Call during component init.
export function useDialogs() {
	const helpers = getContext<Helpers>("wx-helpers");
	return {
		notice(text: string, type: NoticeType = "info") {
			helpers.showNotice({ text, type });
		},
		// resolves to false when the user cancels
		async confirm(title: string, message?: string): Promise<boolean> {
			try {
				await helpers.showModal({ title, message });
				return true;
			} catch {
				return false;
			}
		},
	};
}
