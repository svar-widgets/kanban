<script lang="ts">
	import { getContext } from "svelte";
    import { KANBAN_API_CONTEXT } from "../context.js";
    import type { KanbanContextApi, CardCssFn, ColumnCssFn, CardShape } from "../types.js";
    import type { Component } from "svelte";
    import type { KanbanCard } from "@svar-ui/kanban-store";

    type Props = {
        cardShape: CardShape;
        cardCss?: CardCssFn;
        columnCss?: ColumnCssFn;
        cardContent?: Component<{ card: KanbanCard; cardShape: CardShape }>;
    };
    let { cardCss, columnCss, cardContent:CardContent, cardShape }: Props = $props();

    const store = getContext<KanbanContextApi>(KANBAN_API_CONTEXT);
    const viewData = store.getReactiveState().viewData;
    
    let root = $state<HTMLDivElement>();
    $effect(() => {
        const out:Record<string, any> = {};

        if (CardContent){
            const c:Record<string, string> = {};
            root!.querySelectorAll(".wx-ex-cell").forEach(element => {
                c[(element as HTMLDivElement).dataset.id!] = element.innerHTML;
            });
            out.cardContent = c;
        }

        const cs:Record<string, string> = {};
        if (cardCss){
            $viewData.columns.forEach(column => {
                column.cards.forEach(card => {
                    cs[card.id.toString()] = cardCss(card, column);
                });
            });
            out.cardCss = cs;
        }
        const cls:Record<string, string> = {};
        if (columnCss){
            $viewData.columns.forEach(column => {
                cls[column.id.toString()] = columnCss(column.cards, column);
            });
            out.columnCss = cls;
        }

        store.exec("export-data", { format: "inner", data: out });
    });
</script>

<div style="visibility: hidden;position:absolute;" bind:this={root}>
    {#if CardContent}
        {#each $viewData.columns as column}
            {#each column.cards as card}
                <div class="wx-ex-cell" data-id={card.id} >
                    <CardContent
                        {card}
                        {cardShape}
                    ></CardContent>
                </div>
            {/each}
        {/each}
    {/if}
</div>