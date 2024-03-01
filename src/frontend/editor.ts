import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";

export function createEditor() {
    console.log("Creating editors");
    document.querySelectorAll<HTMLElement>(".editor-js").forEach((element) => {
        console.log("Setting up editor for ", element);
        const editorId = element.querySelector("input")?.id;

        console.log("Editor setup for ", editorId!);

        const editor = new EditorJS({
            holder: element,
            inlineToolbar: true,
            tools: {
                header: Header,
                paragraph: {
                    class: Paragraph,
                    inlineToolbar: true,
                },
            },
        });

        // editor
        //     .save()
        //     .then((output: object) => {
        //         saveData(output, editorId!);
        //     })
        //     .catch(console.error);
    });
}

function saveData(output: object, id: string) {
    console.log("Saving ", id, "data: ", output);
}
