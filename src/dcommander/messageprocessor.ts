export abstract class MessageProcessor {
    tasks: Task[];
    state: ProcessingState;

    setTasks(tasks: Task[]) {
        this.tasks = tasks;
    }

    setInitialState(state: ProcessingState): void {
        this.state = state;
    }

    process(message: any): any | ProcessingState {
        for(let task of this.tasks) {
            this.state = task.execute(this.state);
        }
        return this.state;
    }
}

export interface Task {
    execute(state: ProcessingState): ProcessingState;
}

export interface ProcessingState {
}