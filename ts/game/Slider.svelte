<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let text = "Hello, world!";
    export let min = 0;
    export let max = 100;
    export let value = 50;

    let slider: HTMLDivElement;
    let thumb: HTMLDivElement;
    let label: HTMLDivElement;

    function handleMouseDown(event: MouseEvent) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);        
        updateValue(event.clientX);
    }
    
    function handleMouseUp() {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }    

    function handleMouseMove(event: MouseEvent) {
        if (event.buttons === 1) {
            updateValue(event.clientX);
        }
    }

    function updateValue(mouseX: number) {
        const rect = slider.getBoundingClientRect();
        let t = Math.max(0, Math.min((mouseX - rect.left - thumb.clientWidth / 2) / (rect.width - thumb.clientWidth), 1))
        value = Math.round(min + t * (max - min));
        dispatch('sliderChange', { value });
    }

    function updateThumb(slider: HTMLDivElement, min: number, max: number, value: number) {
        if (!slider) return;
        const rect = slider.getBoundingClientRect();
        const t = (value - min) / (max - min);
        const x = t * (rect.width - thumb.clientWidth);
        thumb.style.left = `${x}px`;
        label.textContent = `${text} ${value}`;
        // console.log("moveThumb", t, value, x);
    }

    $: updateThumb(slider, min, max, value);
</script>

<div style="flex: 1; display: flex; border: .125rem solid #ddd;">
    <div bind:this={slider} class="slider" on:mousedown={handleMouseDown}>
        <div bind:this={thumb} class="thumb"></div>
        <div bind:this={label} class="label">{text}</div>
    </div>    
</div>

<style>
.slider {
    position: relative;
    flex: 1;
    width: 100%;
    height: 2rem;
    background-color: var(--bg1);
    overflow: hidden;
}
.thumb {
    position: absolute;
    top: 0;
    left: 50;
    width: 0.125rem;
    height: 100%;
    background-color: #00f;
    z-index: 1;
}
.label {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>