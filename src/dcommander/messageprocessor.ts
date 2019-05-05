export abstract class MessageProcessor {
    tasks: Task[];
    state: ProcessingState;

    setTasks(tasks: Task[]) {
        this.tasks = tasks;
    }

    setInitialState(state: ProcessingState): void {
        this.state = state;
    }

    process(message: any): any {
        return this.processWithState(message, this.state);
    }

    protected processWithState(message: any, initialState: ProcessingState): any {
        return this.tasks.reduce((currentState, task) => task.execute(currentState), initialState)
    }
}

export interface Task {
    execute(state: ProcessingState): ProcessingState;
}

export interface ProcessingState {
}