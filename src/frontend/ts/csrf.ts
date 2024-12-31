import * as htmx from "htmx.org";

interface HTMXEvent extends Event {
    detail: {
        headers: {
            [key: string]: string;
        };
    };
}

declare module "htmx.org" {
    function on(event: string, callback: (e: HTMXEvent) => void): void;
}

export function get_csrf(): string | null {
    const csrf = document.querySelector('meta[name="csrf"]') as HTMLMetaElement;
    return csrf?.content;
}

htmx.on("htmx:configRequest", (e: HTMXEvent) => {
    const csrf = get_csrf();
    if (csrf) {
        e.detail.headers["X-CSRFToken"] = csrf;
    }
});
