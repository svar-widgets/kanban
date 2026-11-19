// UI shared by the samples for everything outside the Kanban widget.
// Samples import controls from here, never from @svar-ui/svelte-core directly,
// so their look is changed in one place.
export { default as DemoPage } from "./DemoPage.svelte";
export { default as DemoToolbar } from "./DemoToolbar.svelte";
export { default as ToolbarGroup } from "./ToolbarGroup.svelte";
export { default as Toggle } from "./Toggle.svelte";
export { default as Choice } from "./Choice.svelte";
export { default as SelectBox } from "./SelectBox.svelte";
export { default as RangeInput } from "./RangeInput.svelte";
export { default as Hint } from "./Hint.svelte";
export { default as Stat } from "./Stat.svelte";
export { default as EventLog } from "./EventLog.svelte";
export { default as Message } from "./Message.svelte";
export { default as FileButton } from "./FileButton.svelte";
export { EventLogState, type LogEntry } from "./log.svelte";
export { useDialogs, type NoticeType } from "./dialogs";
export { Button, Text } from "@svar-ui/svelte-core";
