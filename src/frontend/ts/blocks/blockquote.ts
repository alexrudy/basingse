import icon from "../icon";

export class BlockQuote {
    data: Data;
    wrapper: HTMLElement | undefined;

    constructor({ data }: { data: Data }) {
        this.data = data;
        this.wrapper = undefined;
    }

    render() {
        return this._render_quote(this.data.text || "A quote as great as time");
    }

    _render_quote(text: string) {
        const div = document.createElement("div");
        div.contentEditable = "true";
        const blockquote = document.createElement("blockquote");
        blockquote.textContent = text;
        div.appendChild(blockquote);
        return div;
    }

    save(blockContent: any) {
        const text =
            blockContent.querySelector("blockquote")?.textContent || "";

        return { text };
    }

    static get toolbox() {
        return {
            title: "Block Quote",
            icon: icon("chat-fill"),
        };
    }
}

interface Data {
    text: string;
}
