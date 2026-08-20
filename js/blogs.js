const blogsList = document.querySelector('.blogs-list');

window.onload = async () => {
    const blogsData = await loadData('blogs.json');
    renderBlogs(blogsData, blogsList);
};

function renderBlogs(data, container) {
    container.innerHTML = data.map(item => `
        <article class="blogs-item card-surface reveal${getItemModifiers(item)}">
            <h2 class="blogs-item-title">
                ${item.isSeries ? '<span class="tag tag--solid">Series</span>' : ''}
                ${getTitleHTML(item)}
            </h2>
            <div class="blogs-item-meta">
                ${getDateHTML(item.date)}
                ${item.isWritten ? '' : '<span class="tag">Coming soon</span>'}
            </div>
        </article>
    `).join('');

    observeReveals(container);
}

function getItemModifiers(item) {
    let modifiers = item.isSeries ? ' blogs-item-series' : '';
    if (!item.isWritten)
        modifiers += ' blogs-item-upcoming';
    return modifiers;
}

/* posts that have not been written yet are plain text - linking to an empty
   page is a dead end, and a disabled looking link invites pointless clicks */
function getTitleHTML(item) {
    if (!item.isWritten)
        return `<span>${item.title}</span>`;

    if (isExternal(item.route)) {
        return `
            <a class="blogs-item-external" href="${item.route}" target="_blank" rel="noopener noreferrer">
                ${item.title}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                    <path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                </svg>
                <span class="visually-hidden">(opens in a new tab)</span>
            </a>
        `;
    }

    return `<a href="${item.route}">${item.title}</a>`;
}

function getDateHTML(date) {
    if (!date)
        return '';

    return `
        <span class="blogs-item-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            ${date}
        </span>
    `;
}

function isExternal(route) {
    return /^https?:\/\//.test(route);
}

async function loadData(jsonFileName) {
    const response = await fetch(`data/${jsonFileName}`);
    return response.json();
}
