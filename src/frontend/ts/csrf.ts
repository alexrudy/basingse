import "htmx.org";

interface HTMXEvent extends Event {
    detail: {
        headers: {
            [key: string]: string;
        };
    };
}

export function get_csrf(): string | null {
    const csrf = document.querySelector('meta[name="csrf"]') as HTMLMetaElement;
    return csrf?.content;
}
