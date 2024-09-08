<script lang="ts">
    import { onMount } from 'svelte';
    import { Editor } from './Editor';
    import EditorToolbar from './EditorToolbar.svelte';

    export let editor: Editor;
    let canvas: HTMLElement;

    onMount(() => editor.start(canvas));
</script>

<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex;">
    <EditorToolbar editor={editor}
        on:new={() => editor.new()}
        on:undo={() => editor.undoRedoManager.undo()}
        on:redo={() => editor.undoRedoManager.undo()}
        ></EditorToolbar>
    <canvas bind:this={canvas} style="flex: 1; min-width: 0; min-height: 0;"></canvas>
</div>