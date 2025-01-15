<script lang="ts">
    import { onMount } from 'svelte';
    import { RiderEditor } from './RiderEditor';
    import { undoRedoManager } from './RiderEditorStore';
    import Edges from './Edges.svelte';
    import Vertices from './Vertices.svelte';
    import RiderEditorToolbar from './RiderEditorToolbar.svelte';

    export let riderEditor: RiderEditor;
    let canvas: HTMLCanvasElement;

    onMount(() => riderEditor.start(canvas));
</script>

<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; overflow: hidden;">
    <RiderEditorToolbar riderEditor={riderEditor}
        on:new={() => riderEditor.new()}
        on:undo={() => undoRedoManager.undo()}
        on:redo={() => undoRedoManager.redo()}
        ></RiderEditorToolbar>
    <canvas bind:this={canvas} style="flex: 1; min-width: 0; min-height: 0;"></canvas>
    <div style="border-left: 1px solid darkgray;"></div>
    <div style="display: flex; flex-direction: column;">
        <div style="overflow-y: auto; min-size: 0;">
            <Edges></Edges>
        </div>
        <div style="border-bottom: 1px solid darkgray;"></div>
        <Vertices></Vertices>
    </div>
</div>