import {CommandSchema} from "./command/CommandSchema";
import {EventEmitter} from "events";
import {Message} from "discord.js";
import {CommandManager} from "./command/CommandManager";
import {CommandParser} from "./parse/Parser";

export class DCommander extends EventEmitter {
    config: DCommanderConfig;
    commandManager: CommandManager;
    parser: CommandParser;

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