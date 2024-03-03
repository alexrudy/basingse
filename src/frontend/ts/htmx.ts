import htmx from "htmx.org";
import { get_csrf } from "./csrf";
import Sortable from "sortablejs";

interface HTMXEvent extends Event {
    detail: {
        headers: {
            [key: string]: string;
        };
    };
}




export function connect() {

    htmx.onLoad(function (content: Element) {
        const csrf_token = get_csrf();
        if (!csrf_token) {
            console.error("No CSRF token found");
            return;
        }
        document.body.addEventListener("htmx:configRequest", function (evt: Event) {
            (evt as HTMXEvent).detail.headers["X-CSRFToken"] = csrf_token; // add the CSRF token
        });
    });


    htmx.defineExtension("json-enc", {
        onEvent: function (name: string, evt: HTMXEvent) {
            if (name === "htmx:configRequest") {
                evt.detail.headers["Content-Type"] = "application/json";

                const token = get_csrf();
                if (token) {
                    evt.detail.headers["X-CSRFToken"] = token;
                }
            }
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        encodeParameters: function (xhr, parameters: object, elt) {
            xhr.overrideMimeType("text/json");
            return JSON.stringify(parameters);
        },
    });

    htmx.onLoad(function (content: Element) {
        const sortables = (
            content as HTMLElement
        ).querySelectorAll<HTMLElement>(".sortable");
        for (let i = 0; i < sortables.length; i++) {
            const sortable = sortables[i];
            new Sortable(sortable, {
                animation: 150,
                ghostClass: "blue-background-class",
            });
        }
    });

    htmx.onLoad(function (content: Element) {
        const sortables = (
            content as HTMLElement
        ).querySelectorAll<HTMLElement>(".nav-sortable-admin .navbar-nav");
        for (let i = 0; i < sortables.length; i++) {
            const sortable = sortables[i];
            new Sortable(sortable, {
                animation: 150,
                draggable: ".nav-item",
                ghostClass: "blue-background-class",
            });
        }
    });
}
