export type Action = {
    undo: () => void,
    redo: () => void
}

export class UndoRedoManager {
    private undoRedoStack: Action[] = [];
    private undoRedoIndex = 0;

    addAction(action: Action) {
        this.undoRedoStack = this.undoRedoStack.slice(0, this.undoRedoIndex);
        this.undoRedoStack.push(action);
        this.undoRedoIndex = this.undoRedoStack.length;
        action.redo();
    }

    undo() {
        console.log("undo");
        let action = this.undoRedoStack[this.undoRedoIndex - 1];
        if (action) {
            action.undo();
            this.undoRedoIndex--;
        }
    }

    redo() {
        console.log("redo");
        let action = this.undoRedoStack[this.undoRedoIndex];
        if (action) {
            action.redo();
            this.undoRedoIndex++;
        }
    }

    clear() {
        this.undoRedoStack = [];
        this.undoRedoIndex = 0;
    }
}