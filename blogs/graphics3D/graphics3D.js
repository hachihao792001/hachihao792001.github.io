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

// ------------------------ NAVIGATION ------------------------
(async function () {
    const body = document.body;
    const currentId = body.dataset.graphics3dId;

    if (!currentId) {
        console.warn("Missing data-graphics3d-id on <body>");
        return;
    }

    // Load json
    const res = await fetch("graphics3D.json");
    const list = await res.json();

    const index = list.findIndex(item => item.id === currentId);
    if (index === -1) {
        console.warn("Current graphics3D id not found in json:", currentId);
        return;
    }

    const current = list[index];
    const prev = list[index - 1];
    const next = list[index + 1];

    // ===== SET TITLE =====
    document.title = current.webTitle;

    // ===== RENDER NAV =====
    const renderNav = () => {
        let html = `<div class="d-flex gap-2 mb-1">`;

        if (prev) {
            html += `
                <a class="btn btn-outline-primary" href="${prev.route}">
                    ← ${prev.webTitle}
                </a>
            `;
        }

        if (next) {
            html += `
                <a class="btn btn-outline-primary" href="${next.route}">
                    ${next.webTitle} →
                </a>
            `;
        }

        html += `</div>
            <a class="btn btn-outline-secondary" href="/blogs/graphics3D/graphics3D-intro.html">
                Về trang chủ series
            </a>`;

        return html;
    };

    const top = document.getElementById("graphics3D-nav-top");
    const bottom = document.getElementById("graphics3D-nav-bottom");

    if (top) top.innerHTML = renderNav();
    if (bottom) bottom.innerHTML = renderNav();
})();

// ------------------------ END NAVIGATION ------------------------

updatePreview();
