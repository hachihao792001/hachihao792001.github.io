(async function () {
    const body = document.body;
    const currentId = body.dataset.nvqsId;

    if (!currentId) {
        console.warn("Missing data-nvqs-id on <body>");
        return;
    }

    // Load json
    const res = await fetch("nvqs.json");
    const list = await res.json();

    const index = list.findIndex(item => item.id === currentId);
    if (index === -1) {
        console.warn("Current NVQS id not found in json:", currentId);
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
            <a class="btn btn-outline-secondary" href="/blogs/nvqs/nvqs-intro.html">
                Về trang chủ series
            </a>`;

        return html;
    };

    const top = document.getElementById("nvqs-nav-top");
    const bottom = document.getElementById("nvqs-nav-bottom");

    if (top) top.innerHTML = renderNav();
    if (bottom) bottom.innerHTML = renderNav();
})();
