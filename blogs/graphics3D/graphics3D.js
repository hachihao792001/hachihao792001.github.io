const htmlPreviewDivs = document.querySelectorAll(".htmlPreview");

async function updatePreview() {
    for (const htmlPreviewDiv of htmlPreviewDivs) {
        const htmlPreviewId = htmlPreviewDiv.id;
        const htmlCode = await fetchHTMLCode(htmlPreviewId);

        const codePane = document.createElement("div");
        codePane.className = "codePane";
        const iframe = document.createElement("iframe");
        iframe.srcdoc = htmlCode;
        htmlPreviewDiv.appendChild(codePane);
        htmlPreviewDiv.appendChild(iframe);

        const copyButton = document.createElement("button");
        copyButton.className = "copy-btn";
        copyButton.textContent = "Copy";
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(htmlCode);
            copyButton.textContent = "Copied!";
            setTimeout(() => {
                copyButton.textContent = "Copy";
            }, 2000);
        });
        codePane.appendChild(copyButton);

        const preTag = document.createElement("pre");
        codePane.appendChild(preTag);
        const codeTag = document.createElement("code");
        codeTag.className = "language-html";
        codeTag.innerHTML = htmlCode.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        preTag.appendChild(codeTag);
        Prism.highlightElement(codeTag);
    }
}

async function fetchHTMLCode(htmlPreviewId) {
    const response = await fetch("htmlPreviews/" + htmlPreviewId + ".html");
    const htmlCode = await response.text();
    return htmlCode;
}

updatePreview();
