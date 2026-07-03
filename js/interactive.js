const interactivesContainer = document.querySelector('.interactive');

window.onload = async () => {
    const interactivesData = await loadData('interactives.json');
    renderInteractives(interactivesData, interactivesContainer);
}

function renderInteractives(data, container) {
    data.forEach(item => {
        const interactiveItem = document.createElement('div');
        interactiveItem.className = 'interactives-item-container';
        
        interactiveItem.innerHTML = `
            <div class="interactive-item">
                <a href="${item.route}">${item.title}</a>
                <p>${item.description}</p>
            </div>
        `;

        container.appendChild(interactiveItem);
    });
}

async function loadData(jsonFileName) {
    const response = await fetch(`data/${jsonFileName}`)
    const jsondata = await response.json();
    return jsondata;
}