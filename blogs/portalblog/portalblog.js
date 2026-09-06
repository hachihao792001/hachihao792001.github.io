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
    // the intro page is the series index, so the chapters are numbered from it
    const chapterCount = list.length - 1;
    const chapterNumber = index;

    const renderNav = (position) => {
        const pagerLink = (item, direction, label) => item
            ? `
                <a class="g3d-pager-link g3d-pager-${direction}" href="${item.route}">
                    <span class="g3d-pager-dir">${label}</span>
                    <span class="g3d-pager-title">${item.webTitle}</span>
                </a>
            `
            : '<span class="g3d-pager-link is-empty" aria-hidden="true"></span>';

        return `
            ${chapterNumber > 0 ? `
                <p class="g3d-progress">
                    <span class="g3d-progress-label">Phần ${chapterNumber} / ${chapterCount}</span>
                    <span class="g3d-progress-track">
                        <span class="g3d-progress-bar" style="width: ${(chapterNumber / chapterCount) * 100}%"></span>
                    </span>
                </p>
            ` : ''}

            <nav class="g3d-pager" aria-label="Điều hướng series${position ? ` (${position})` : ''}">
                ${pagerLink(prev, 'prev', '← Bài trước')}
                ${pagerLink(next, 'next', 'Bài sau →')}
            </nav>

            <a class="button button--ghost g3d-pager-home" href="/blogs/graphics3D/graphics3D-intro.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                    stroke-linecap="round" stroke-linejoin="round" width="16" height="16"
                    aria-hidden="true" focusable="false">
                    <path d="M3 5h18M3 12h18M3 19h18" />
                </svg>
                Về trang chủ series
            </a>
        `;
    };

    const top = document.getElementById("graphics3D-nav-top");
    const bottom = document.getElementById("graphics3D-nav-bottom");

    // both pagers are the same links, so they need distinguishable labels
    if (top) top.innerHTML = renderNav('đầu bài');
    if (bottom) bottom.innerHTML = renderNav('cuối bài');
})();

// ------------------------ END NAVIGATION ------------------------

updatePreview();
