<script lang="ts">
    import { riderEntryStore, overVertex, selectedVertex, undoRedoManager } from './RiderEditorStore';
    import type { Edge, Vertex} from '../RiderCreator';
    $: riderEntry = $riderEntryStore.json;

    let dragging = false;
    let startY = 0;
    let startValue = 0;
    let dragVertex: Vertex | null = null;
    let dragProperty = '';
    let dragConfig = {
        radius: { min: 0, max: 999, step: 1 },
        mass: { min: 0, max: 999, step: 1 },
    }
    
    function clamp(value, config) {
        return Math.max(config.min, Math.min(config.max, value));
    }

    function getVertexAndProperty(target): [Vertex | null, string | null, any | null ] {
        const parentVertex = target.closest('.vertex');
        if (parentVertex) {
            const index = parentVertex.dataset.index;
            const vertex = riderEntry.vertices[index];
            const property = target.dataset.property;
            return [ vertex, property, dragConfig[property] ];
        }
        return [null, null, null];
    }

    function handleMouseDown(event) {
        let [vertex, property, config] = getVertexAndProperty(event.target);
        if (vertex) {
            selectedVertex.set(vertex);
        }
        if (config) {
            dragging = true;
            startY = event.clientY;
            startValue = clamp(vertex[property], config);
            dragVertex = vertex;
            dragProperty = property;
        }
    }

    function handleMouseMove(event) {
        if (dragging && dragVertex) {
            const diffY = startY - event.clientY;
            const conf = dragConfig[dragProperty];
            dragVertex[dragProperty] = clamp(startValue + diffY * conf.step, conf);
            $riderEntryStore = $riderEntryStore;
        }
    }

    function handleMouseUp() {
        if (dragging) {
            changeProperty(dragVertex, dragProperty, startValue, dragVertex[dragProperty]);
        }        
        dragging = false;
        dragVertex = null;
        dragProperty = '';
    }

    function handleWheel(event) {
        let [vertex, property, config] = getVertexAndProperty(event.target);
        if (config) {
            const delta = event.deltaY > 0 ? -config.step : config.step;
            changeProperty(vertex, property, vertex[property], clamp(vertex[property] + delta, config));
            event.preventDefault();
        }
    }

    function handleMouseLeave(event) {
        overVertex.set(null);
    }

    function handleMouseOver(event) {
        if (!dragging) {
            let [vertex, property, config] = getVertexAndProperty(event.target);
            overVertex.set(vertex);
        }
    }

    function changeProperty(vertex, property, oldValue, newValue) {
        undoRedoManager.addAction({
            undo: () => vertex[property] = oldValue,
            redo: () => vertex[property] = newValue
        });
    }

    function handleCheckboxChange(event, vertex, property: string) {
        changeProperty(vertex, property, vertex[property], event.target.checked);
    }    

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);    
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style="display: flex; flex-direction: column;">
    <div class="grid" on:mousemove={handleMouseOver} on:mousedown={handleMouseDown} on:mouseleave={handleMouseLeave} on:wheel={handleWheel}>
        <div class="header" title="Radius">⚪</div>
        <div class="header" title="Mass">🧱</div>
        <div class="header" title="Collidable">🏹</div>
        <div class="header" title="Death Trigger">☠️</div>
        <div class="header" title="Tire"><img style="width: calc(1em + 2px); height: calc(1em + 2px);" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIwSURBVFhH7Ze/TxRBFMcPhWhiIFD4IyD2tAaCiYmNpa2hprChg//BxIQKQmJIKKy11pKG1h+NhY2dwaiJkICBYCT4/dzbubx7N3e7e2ho7pN8snO7M292Z97M7jUGDKjBVflYvpAf5YH8Uxz5zXmuU++fMiJX5Hd5VkHqLUvanZtp+V7mOirznaR939yVX2UueFW/yVlZG+481/mh3JAPJXN/XU4WvznP9diGm6g1EsxdbthfyVsy8UXetmILrlMvtmU6KucECRcDrMoh6fkkZ6zYBvWeyRiDxCyFJRSznSeKncNbOWfFDqgfR4K4pUuUdewbMad+2D3bkrnvBu1iThC/J2wmvgGJFbki1+RvSQfrxbkctPfxiN8TdjTfIPeEdO7rIOdy0N7XI34bcW5ZWqNWbDIlWY6ePTlhxRb7khVxQ94sjtck9Z7LBCM2ZkUj3gB7+2UrNmGNj0uCpsCsiJhMPN2J/CFJNo50dkkuyMSpHLaiUTYCP2UKmGRnuyc9m3LJim3wALtWbNIxApEqOZCS8Egey15JWJoDkSqrIPFEblmxK6WrgDnyvCmOiUXZbR/4Jf10RWhHe0+M30GdnfCRfG3FDqj/Uvo4lXZCyL0L2NvjTTyQO1Zsg3pPZYxR6V0AVd+GfC98sGILrscnR+LV+kLi/c17PAZiGZFYZPd9+VmWfQ8w9HdkbXjT5W6ijnQ+L/vmPN+EtOvrySPM3YV9FXtYQhfyv2DAf6TR+AtyrBavwmHSnQAAAABJRU5ErkJggg==" alt="tire" /></div>
        <div class="header" title="Drive Train">🔥</div>

        {#each riderEntry.vertices as vertex, index}
        <div class="vertex {vertex === $overVertex ? 'hover' : ''}  {vertex === $selectedVertex ? 'selected' : ''}"  data-index={index}>
            <div data-property="radius">{Math.round(Math.min(vertex.radius, 999))}</div>
            <div data-property="mass">{Math.round(Math.min(vertex.mass, 999))}</div>
            <div><input type="checkbox" checked={vertex.collidable} on:change={(event) => handleCheckboxChange(event, vertex, "collidable")} style="width: 100%;" /></div>
            <div><input type="checkbox" checked={vertex.deathTrigger} on:change={(event) => handleCheckboxChange(event, vertex, "deathTrigger")} style="width: 100%;" /></div>
            <div><input type="checkbox" checked={vertex.wheel}      on:change={(event) => handleCheckboxChange(event, vertex, "wheel")} style="width: 100%;" /></div>
            <div><input type="checkbox" checked={vertex.driveTrain} on:change={(event) => handleCheckboxChange(event, vertex, "driveTrain")} style="width: 100%;" /></div>
        </div>
        {/each}
    </div>     
 </div>

<style>
    .grid {
        background-color: var(--bg1); 
        overflow-y: auto;
        
        display: grid;
        grid-template-columns3: 2em 3em auto auto 2em 2em;
        grid-template-columns2: 1fr 1.5fr 1fr 1fr 1fr 1fr;
        grid-template-columns: minmax(2em, 1fr) minmax(3em, 1.5fr) minmax(2em, 1fr) minmax(2em, 1fr) minmax(2em, 1fr) minmax(2em, 1fr);
        text-align: center;
    }

    .header {
        font-weight: bold;
    }

    .vertex {
        display: contents;
    }    

    .vertex > div:nth-child(odd) {
        background-color: #f8fff9;
    }

    .vertex.hover > div {
        background-color: var(--bg-hover);
    }
    
    .vertex.selected > div {
        background-color: #ff7043;
        opacity: 0.8;
    }

    select {
        /* padding: 0;0.125rem; */
        padding: 0;
    }

</style>