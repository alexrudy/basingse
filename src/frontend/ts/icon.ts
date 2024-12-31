export default function icon(name: string): string {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("bi", "pe-none", "align-self-center");
    svg.setAttribute("fill", "currentColor");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute(
        "xlink:href",
        `/static/bootstrap/icons/bootstrap-icons.svg#${name}`,
    );
    svg.appendChild(use);
    return svg.outerHTML;
}
