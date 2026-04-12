const blogsContainer = document.querySelector('.blogs');

window.onload = async () => {
    const blogsData = await loadData('blogs.json');
    renderBlogs(blogsData, blogsContainer);
}

function renderBlogs(data, container) {
    data.forEach(item => {
        const blogItem = document.createElement('div');
        blogItem.className = 'blogs-item-container';
        
        blogItem.innerHTML = `
            <div class="blogs-item${item.isSeries ? ' blogs-item-series' : ''}">
                <div class="blogs-item-title">
                    ${item.isSeries ? '<span class="series-badge">Series</span>' : ''}
                    <a href="${item.route}">${item.title}</a>
                </div>
                ${item.date ? `<span class="blogs-item-date">${item.date}</span>` : ''}
                ${getCommingSoonHTML(item.isWritten)}
            </div>
        `;

        container.appendChild(blogItem);
    });
}

function getCommingSoonHTML(isWritten) {
    if (isWritten) {
        return '';
    } else {
        return `
            <div class="btn btn-outline-primary p-1">
                Comming Soon
            </div>
        `;
    }
}

async function loadData(jsonFileName) {
    const response = await fetch(`data/${jsonFileName}`)
    const jsondata = await response.json();
    return jsondata;
}