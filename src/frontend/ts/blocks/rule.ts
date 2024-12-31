import icon from "../icon";

export class HorizontalRule {
    render() {
        const div = document.createElement("div");
        div.innerHTML = "<hr>";
        return div;
    }

    save(blockContent: any) {
        return {};
    }

    static get toolbox() {
        return {
            title: "Horizontal Rule",
            icon: icon("hr"),
        };
    }
}
