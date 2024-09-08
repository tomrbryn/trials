let eventSource: EventSource | null = null;

export function setupServerSideEvents(callback) {
    if (eventSource) {
        eventSource.close();
    }

    console.log("setupServerSideEvents");
    eventSource = new EventSource(`/trials/events`);
    eventSource.onmessage = callback;
    eventSource.onerror = (_) => {
        eventSource?.close();
        setTimeout(() => setupServerSideEvents(callback), 2000);
    };
}    

export function setupReload() {
    setupServerSideEvents((e) => {
        setTimeout(() => location.reload(), e.data.endsWith(".js") ? 0 : 3000);
    });
}