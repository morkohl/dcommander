import {CommandInstructions} from "./CommandSchema";
import {Argument} from "../schema/Argument";

export interface Command {
    name: string;
    arguments: { [key: string]: Argument };
    execution: (instructions: CommandInstructions) => void;
}