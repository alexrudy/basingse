class FieldList {
    private element: HTMLElement;
    private itemtag: string = "li";
    private ids: FieldListIds;

    constructor(element: HTMLElement) {
        this.element = element;

        const row = element.querySelector(".field-list-row");
        if (row === null) {
            throw new Error("No field-list-row found");
        }

        this.itemtag = row.tagName.toLowerCase();
        this.ids = new FieldListIds(row);

        this.instrument();
    }

    public onAddRowClick(event: Event) {
        this.addRow();
    }

    public addRow() {
        const index = this.element.querySelectorAll(".field-list-row").length;
        const row = this.element.querySelector(".field-list-row");
        if (row === null) {
            throw new Error("No field-list-row found");
        }

        const newRow = row.cloneNode(true) as HTMLElement;
        newRow.id = this.ids.itemId(index);
        newRow.querySelectorAll("input").forEach((input) => {
            const inputElement = input as HTMLInputElement;
            inputElement.value = "";
            const name = inputElement.getAttribute("name");
            if (name === null) {
                throw new Error("No name attribute found");
            }
            inputElement.setAttribute(
                "name",
                name.replace(/\[\d+\]/, `[${index}]`),
            );
        });

        newRow.querySelectorAll("select").forEach((select) => {
            const selectElement = select as HTMLSelectElement;

            const name = selectElement.getAttribute("name");
            const parts = name?.split("-");
            parts?.pop();

            parts?.push(index.toString());
            const newName = parts?.join("-");

            if (name === null) {
                throw new Error("No name attribute found");
            }

            selectElement.setAttribute("name", newName!);
            selectElement.id = newName!;
        });

        newRow.querySelectorAll(".field-list-remove").forEach((element) => {
            element.addEventListener("click", (event) => {
                this.onRemoveRowClick(event);
            });
        });

        const rows = this.element.querySelectorAll(".field-list-row");
        const lastRow = rows[rows.length - 1];
        lastRow.insertAdjacentElement("afterend", newRow);
    }

    public onRemoveRowClick(event: Event) {
        const target = event.target as HTMLElement;
        const row = target.closest(".field-list-row") as HTMLElement;
        if (row === null) {
            throw new Error("No field-list-row found");
        }
        this.removeRow(row);
    }

    private reindex() {
        this.element
            .querySelectorAll(".field-list-row")
            .forEach((row, index) => {
                row.id = this.ids.itemId(index);
            });
    }

    private instrument() {
        this.element
            .querySelectorAll(".field-list-remove")
            .forEach((element) => {
                element.addEventListener("click", (event) => {
                    this.onRemoveRowClick(event);
                });
            });

        this.element.querySelectorAll(".field-list-add").forEach((element) => {
            element.addEventListener("click", (event) => {
                this.onAddRowClick(event);
            });
        });
    }

    public removeRow(element: HTMLElement) {
        element.remove();
        this.reindex();
    }
}

class FieldListIds {
    private prefix: string;

    constructor(element: Element) {
        const parts = element.id.split("-");

        const index = parts.pop();

        if (index === undefined) {
            throw new Error("No index found in id");
        }
        this.prefix = parts.join("-");
    }

    public itemId(index: number): string {
        return `${this.prefix}-${index}`;
    }
}

export function instrumentFieldLists() {
    document.querySelectorAll<HTMLElement>(".field-list").forEach((element) => {
        const list = new FieldList(element);
    });
}
