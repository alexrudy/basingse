import { io } from "socket.io-client";

function main() {
    const socket = io("ws://localhost:5010");

    socket.on("connect", () => {
        console.log("debug socket.io connected");
    });

    socket.on("change", (data: any) => {
        if (data.path.endsWith(".css")) {
            console.log("Reloading CSS");
            const head = document.querySelector("head");
            const links = document.querySelectorAll<HTMLLinkElement>(
                'link[rel="stylesheet"]',
            );
            links.forEach((link) => {
                const index = link.href.indexOf("?v=");
                if (index === -1) {
                    link.href = link.href + "?v=" + new Date().getTime();
                } else {
                    link.href =
                        link.href.substring(0, index) +
                        "?v=" +
                        new Date().getTime();
                }
                head?.appendChild(link);
            });
            return;
        }

        if (data.path.endsWith(".js")) {
            console.log("Reloading JS");
            const head = document.querySelector("head");
            const scripts =
                document.querySelectorAll<HTMLScriptElement>("script");
            scripts.forEach((script) => {
                const index = script.src.indexOf("?v=");
                if (index === -1) {
                    script.src = script.src + "?v=" + new Date().getTime();
                } else {
                    script.src =
                        script.src.substring(0, index) +
                        "?v=" +
                        new Date().getTime();
                }
                console.log(head, script);
                head?.appendChild(script);
            });
            return;
        }

        window.location.reload();
    });
}

main();
