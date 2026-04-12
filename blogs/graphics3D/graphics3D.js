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

        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttons-container";

        const previewNum = parseInt(htmlPreviewId.replace("htmlPreview", ""));
        const diffButton = document.createElement("button");
        diffButton.className = "diff-btn btn btn-outline-primary";
        diffButton.textContent = "Diff";
        if (previewNum <= 1) {
            diffButton.disabled = true;
        } else {
            diffButton.addEventListener("click", async () => {
                const patchUrl = `patches/diff_${previewNum - 1}_${previewNum}.patch`;
                try {
                    await loadDiff2Html();
                    const res = await fetch(patchUrl);
                    const patchText = await res.text();
                    const diffHtml = Diff2Html.html(patchText, {
                        drawFileList: false,
                        matching: "lines",
                        outputFormat: "side-by-side",
                    });
                    showDiffModal(diffHtml);
                } catch (e) {
                    console.error("Failed to load patch:", e);
                }
            });
        }
        buttonsContainer.appendChild(diffButton);

        const disableButton = document.createElement("button");
        disableButton.className = "disable-btn btn btn-outline-primary";
        disableButton.textContent = "Disable";
        disableButton.addEventListener("click", () => {
            if (iframe.dataset.disabled === "true") {
                iframe.srcdoc = htmlCode;
                iframe.dataset.disabled = "false";
                disableButton.textContent = "Disable";
            } else {
                iframe.srcdoc = "";
                iframe.dataset.disabled = "true";
                disableButton.textContent = "Enable";
            }
        });
        buttonsContainer.appendChild(disableButton);

        const copyButton = document.createElement("button");
        copyButton.className = "copy-btn btn btn-outline-primary";
        copyButton.textContent = "Copy";
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(htmlCode);
            copyButton.textContent = "Copied!";
            setTimeout(() => {
                copyButton.textContent = "Copy";
            }, 2000);
        });
        buttonsContainer.appendChild(copyButton);

        codePane.appendChild(buttonsContainer);

        const preTag = document.createElement("pre");
        codePane.appendChild(preTag);
        const codeTag = document.createElement("code");
        codeTag.className = "language-html";
        codeTag.innerHTML = htmlCode.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        preTag.appendChild(codeTag);
        Prism.highlightElement(codeTag);
    }
}

// ------------------------ DIFF MODAL ------------------------
let diff2HtmlLoaded = null;
function loadDiff2Html() {
    if (window.Diff2Html) return Promise.resolve();
    if (diff2HtmlLoaded) return diff2HtmlLoaded;
    diff2HtmlLoaded = new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return diff2HtmlLoaded;
}

const diffModal = document.createElement("div");
diffModal.className = "diff-modal-overlay";
diffModal.innerHTML = `
    <div class="diff-modal">
        <div class="diff-modal-header">
            <span>Diff</span>
            <button class="btn btn-outline-secondary btn-sm diff-modal-close">&times;</button>
        </div>
        <div class="diff-modal-body"></div>
    </div>
`;
document.body.appendChild(diffModal);

diffModal.addEventListener("click", (e) => {
    if (e.target === diffModal) diffModal.style.display = "none";
});
diffModal.querySelector(".diff-modal-close").addEventListener("click", () => {
    diffModal.style.display = "none";
});

function showDiffModal(diffHtml) {
    diffModal.querySelector(".diff-modal-body").innerHTML = diffHtml;
    diffModal.style.display = "flex";
}
// ------------------------ END DIFF MODAL ------------------------

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
