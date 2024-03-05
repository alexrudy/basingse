import { createEditor } from "./editor";
import { connect } from "./htmx";

export function init(blocks: object) {
    connect();
    createEditor(blocks);
}
