import * as yargs from "yargs";
import { handler } from "./cmds/divelog";

handler({ file: process.argv[3] });
