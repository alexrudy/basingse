import { createEditor } from "./editor";
import { connect } from "./htmx";

function main() {
    connect();
    createEditor();
}

main();
