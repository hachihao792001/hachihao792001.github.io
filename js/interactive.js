const interactiveList = document.querySelector('.interactive-list');

window.onload = async () => {
    const interactivesData = await loadData('interactives.json');
    renderInteractives(interactivesData, interactiveList);
};

function renderInteractives(data, container) {
    container.innerHTML = data.map(item => `
        <article class="interactive-item card-surface reveal">
            <h2 class="interactive-item-title">
                <a href="${item.route}">${item.title}</a>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            </h2>
            <p>${item.description}</p>
        </article>
    `).join('');

    observeReveals(container);
}

async function loadData(jsonFileName) {
    const response = await fetch(`data/${jsonFileName}`);
    return response.json();
}
