<script lang="ts">
    import { riderEntryStore, overEdge, overVertex, selectedEdge, selectedVertex, undoRedoManager } from './RiderEditorStore';
    import type { Edge } from '../RiderCreator';
    $: riderEntry = $riderEntryStore.json;

    undoRedoManager.listeners.push(() => {
        $riderEntryStore = $riderEntryStore;
    });

    let dragging = false;
    let startY = 0;
    let startValue = 0;
    let dragEdge: Edge | null = null;
    let dragProperty = '';
    let dragConfig = {
        stiffness: { min: 0, max: 1, step: 0.01 },
        damping: { min: 0, max: 1, step: 0.01 },
        minLength: { min: 0, max: 1000, step: 1 },
        maxLength: { min: 0, max: 1000, step: 1 },
    }
    function clamp(value, config) {
        return Math.max(config.min, Math.min(config.max, value));
    }

    function getEdgeAndProperty(target): [Edge | null, string | null, any | null ] {
        const parentEdge = target.closest('.edge');
        if (parentEdge) {
            const index = parentEdge.dataset.index;
            const edge = riderEntry.edges[index];
            const property = target.dataset.property;
            return [ edge, property, dragConfig[property] ];
        }
        return [null, null, null];
    }

    function handleMouseDown(event) {
        let [edge, property, config] = getEdgeAndProperty(event.target);
        if (edge) {
            selectedEdge.set(edge);
        }
        if (config) {
            dragging = true;
            startY = event.clientY;
            startValue = clamp(edge[property], config);
            dragEdge = edge;
            dragProperty = property;
            console.log('handleMouseDown', edge?.v1Idx, property, startValue);
        }
    }

    function handleMouseMove(event) {
        if (dragging && dragEdge) {
            const diffY = startY - event.clientY;
            const conf = dragConfig[dragProperty];
            dragEdge[dragProperty] = clamp(startValue + diffY * conf.step, conf);
            $riderEntryStore = $riderEntryStore;
        }
    }

    function handleMouseUp() {
        if (dragging) {
            changeProperty(dragEdge, dragProperty, startValue, dragEdge[dragProperty]);
        }
        dragging = false;
        dragEdge = null;
        dragProperty = '';
    }

    function handleWheel(event) {
        let [edge, property, config] = getEdgeAndProperty(event.target);
        if (config) {
            const newValue = clamp(edge[property] + (event.deltaY > 0 ? -config.step : config.step));
            changeProperty(edge, property, edge[property], newValue, config);
            event.preventDefault();
        }
    }
    
    function handleMouseLeave(event) {
        overEdge.set(null);
    }

    // let overEdge: | Edge | null = null;
    function handleMouseOver(event) {
        if (!dragging) {
            let [edge, property, config] = getEdgeAndProperty(event.target);
            overEdge.set(edge);
        }
    }
    
    function changeProperty(vertex, property, oldValue, newValue) {
        undoRedoManager.addAction({
            undo: () => vertex[property] = oldValue,
            redo: () => vertex[property] = newValue
        });
    }

    // window.addEventListener('mouseleave', handleMouseLeave);
    // window.addEventListener('mouseout', handleMouseLeave);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);    
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style="display: flex; flex-direction: column;">
    <div class="grid" on:mousemove={handleMouseOver} on:mousedown={handleMouseDown} on:mouseleave={handleMouseLeave} on:wheel={handleWheel}>
        <div class="header" title="Vertex Index 1">v1</div>
        <div class="header" title="Vertex Index 2">v2</div>
        <div class="header" title="Visible">👁️</div>
        <div class="header" title="Minimum Length">min</div>
        <div class="header" title="Target Length">📏</div>
        <div class="header" title="Leaning Target Length">📏</div>
        <div class="header" title="Max Length">max</div>
        <div class="header" title="Stiffness">stf</div>
        <div class="header" title="Damping">dmp</div>

        {#each riderEntry.edges as edge, index}
        <div class="edge {edge === $overEdge ? 'hover' : ''}  {edge === $selectedEdge ? 'selected' : ''}"  data-index={index}>
            <div class="{riderEntry.vertices.indexOf($selectedVertex) === edge.v1Idx ? 'vertex-selected' : ''}">{edge.v1Idx}</div>
            <div class="{riderEntry.vertices.indexOf($selectedVertex) === edge.v2Idx ? 'vertex-selected' : ''}">{edge.v2Idx}</div>
            <div><input type="checkbox" style="width: 100%;" checked={edge.visible}
                on:change={(event) => changeProperty(edge, 'visible', edge.visible, event.target.checked)} /></div>

            <div data-property={"minLength"}>{Math.round(edge.minLength)}</div>
            <div>{Math.round(edge.startLength)}</div>
            <div>{Math.round(edge.leanLength)}</div>
            <div data-property="maxLength">{Math.round(Math.min(edge.maxLength, 999))}</div>
            <div data-property="stiffness">{edge.stiffness.toFixed(2)}</div>
            <div data-property="damping">{edge.damping.toFixed(2)}
            </div>
        </div>
        {/each}
    </div>
</div>

<style>
    .grid {
        background-color: var(--bg1); 
        overflow-y: auto;
        display: grid;
        grid-template-columns: 2em 2em 1fr 3em 3em 3em 3em 3em 3em;
        text-align: center;
    }

    .header {
        font-weight: bold;
    }

    .edge {
        display: contents;
    }    

    .edge > div:nth-child(odd) {
        background-color: #f8fff9;
    }

    .edge.hover > div {
        background-color: var(--bg-hover);
    }
    
    .edge.selected > div {
        background-color: #ff7043;
        opacity: 0.8;
    }

    .vertex-selected {
        color: blue;
        background-color: #ff7043 !important;
        opacity: 0.8 !important;
    }

</style>