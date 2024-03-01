import { createEditor } from "./editor";
import { connect } from "./htmx";

function main() {
    console.log("Loading frontend");
    connect();
    createEditor();
}

main();
console.log("Loaded frontend");
