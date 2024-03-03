import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";

export function createEditor() {
    document.querySelectorAll<HTMLElement>(".editor-js").forEach((element) => {
        const input = element.querySelector("input");
        const editorId = input?.id;

        console.log("Editor setup for ", editorId!);

        const editor = new EditorJS({
            holder: element,
            inlineToolbar: true,
            data: input?.value ? JSON.parse(input.value) : undefined,
            tools: {
                header: Header,
                paragraph: {
                    class: Paragraph,
                    inlineToolbar: true,
                },
            },
            placeholder: "Write your page here!"
        });

        const form = findParentBySelector<HTMLFormElement>(element, "form");
        const submit = form?.querySelector("input[name='submit']");

        submit?.addEventListener("click", (event) => {
            event.preventDefault();
            editor
                .save()
                .then((output: object) => {
                    input?.setAttribute("value", JSON.stringify(output));
                    HTMLFormElement.prototype.submit.call(form);
                })
                .catch(console.error);
        });

    });
}

function findParentBySelector<K extends HTMLElement>(element: HTMLElement, selector: string): K | null {
    while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
            return (element.parentElement as K);
        }
        element = element.parentElement;
    }
    return null;
}
