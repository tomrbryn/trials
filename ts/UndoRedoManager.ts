export type Action = {
    undo: () => void,
    redo: () => void
}

export class UndoRedoManager {
    private undoRedoStack: Action[] = [];
    private undoRedoIndex = 0;
    listeners: (() => void)[] = [];

    addAction(action: Action) {
        this.undoRedoStack = this.undoRedoStack.slice(0, this.undoRedoIndex);
        this.undoRedoStack.push(action);
        this.undoRedoIndex = this.undoRedoStack.length-1;
        this.redo();
        action.redo();
    }

    undo() {
        let action = this.undoRedoStack[this.undoRedoIndex - 1];
        if (action) {
            action.undo();
            this.undoRedoIndex--;
            this.notify();
        }
    }

    redo() {
        let action = this.undoRedoStack[this.undoRedoIndex];
        if (action) {
            action.redo();
            this.undoRedoIndex++;
            this.notify();
        }
    }

    notify() {
        this.listeners.forEach(listener => listener());
    }

    clear() {
        this.undoRedoStack = [];
        this.undoRedoIndex = 0;
    }
}