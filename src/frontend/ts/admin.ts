import "../scss/bootstrap.scss";
import "../scss/admin.scss";

import { createEditor } from "./editor";
import { connect } from "./htmx";
import { instrumentFieldLists } from "./admin/listfield";

export function init(blocks: object) {
    connect();
    createEditor(blocks);
    instrumentFieldLists();
}
