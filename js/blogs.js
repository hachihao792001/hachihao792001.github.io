const blogsContainer = document.querySelector('.blogs');

window.onload = async () => {
    const blogsData = await loadData('blogs.json');
    renderBlogs(blogsData, blogsContainer);
}

function renderBlogs(data, container) {
    data.forEach(item => {
        const blogItem = document.createElement('div');
        blogItem.className = 'blogs-item-container';

        const hasChildren = item.children && item.children.length > 0;
        
        blogItem.innerHTML = `
            <div class="blogs-item">
                ${hasChildren ? '<span class="arrow">▶</span>' : ''}
                <a href="${item.route}">${item.title}</a>
                <p>${item.date}</p>
                ${getCommingSoonHTML(item.isWritten)}
            </div>
            ${hasChildren ? `<div class="children-container" style="display: none; margin-left: 20px;"></div>` : ''}
        `;

        if (hasChildren) {
            const childTarget = blogItem.querySelector('.children-container');
            const arrow = blogItem.querySelector('.arrow');
            
            renderBlogs(item.children, childTarget);

            arrow.addEventListener('click', (e) => {
                const isExpanded = childTarget.style.display === 'block';
                childTarget.style.display = isExpanded ? 'none' : 'block';
                arrow.classList.toggle('arrow-down', !isExpanded);
            });
        }

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