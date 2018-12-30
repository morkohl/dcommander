import {CommandInstructions} from "./schema/CommandSchema";
import {Argument} from "../argument/Argument";

export interface Command {
    name: string;
    arguments: { [key: string]: Argument };
    execution: (instructions: CommandInstructions) => void;
}