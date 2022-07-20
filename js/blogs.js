const blogs = document.querySelector('.blogs');

window.onload = async () => {
    const blogsData = await loadData('blogs.json');
    for (var i = 0; i < blogsData.length; i++) {
        blogs.innerHTML += `
            <div class="blogs-item">
                <a href="${blogsData[i].route}">${blogsData[i].title}</a>
                <p>${blogsData[i].date}</p>
                ${getCommingSoonHTML(blogsData[i].isWritten)}
            </div>
        `;
    }
}

function getCommingSoonHTML(isWritten) {
    if (isWritten == "true") {
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