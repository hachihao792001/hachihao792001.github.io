const codeBlockDivs = document.querySelectorAll(".codeBlock");

async function updatePreview() {
    for (const codeBlockDiv of codeBlockDivs) {
        const preTag = document.createElement("pre");
        const codeTag = document.createElement("code");
        codeTag.className = "language-html";
        preTag.appendChild(codeTag);
        codeBlockDiv.appendChild(preTag);
        const iframe = document.createElement("iframe");
        codeBlockDiv.appendChild(iframe);
        
        const codeBlockId = codeBlockDiv.id;
        const htmlCode = await fetchHTMLCode(codeBlockId);

        codeTag.innerHTML = htmlCode.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        Prism.highlightElement(codeTag);
        iframe.srcdoc = htmlCode;
    }
}

async function fetchHTMLCode(codeBlockId) {
    const response = await fetch("codeBlocks/" + codeBlockId + ".html");
    const htmlCode = await response.text();
    return htmlCode;
}

updatePreview();
