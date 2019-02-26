import {CommandSchema} from "./command/schema/CommandSchema";
import {EventEmitter} from "events";
import {Message} from "discord.js";
import {CommandManager} from "./command/manager/CommandManager";

export class DCommander extends EventEmitter {
    config: DCommanderConfig;
    commandManager: CommandManager;

    constructor(options: DCommanderConfig) {
        super();
        this.config = options;
        this.emit('started')
    }

    mount(mount: CommandSchema[]): void {
        this.commandManager = new CommandManager(mount);
    }

    parse(msg: Message): void {
        //parse
    }
}

export interface DCommanderConfig {
    callAsync?: boolean,
    generateHelp?: boolean,
    commandPrefix?: string,
}

let instance: DCommander;

export function getInstance(options: DCommanderConfig) {
    if(instance) {
        return instance;
    } else {
        instance = new DCommander(options);
        return instance;
    }
};