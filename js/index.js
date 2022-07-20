const experience = document.querySelector('.experience');
const project = document.querySelector('.project');

window.onload = async () => {
    const experienceData = await loadData('experience.json');
    for (var i = 0; i < experienceData.length; i++) {
        experience.innerHTML += `
            <div class="experience-item">
                <a href="${experienceData[i].url}">
                    <img src="${experienceData[i].image}" alt="${experienceData[i].title}" width="60px" height="60px">
                </a>
                <div class="experience-item-content">
                    <h3>${experienceData[i].title}</h3>
                    <h6>${experienceData[i].period}</h6>
                    <lead>
                        ${experienceData[i].description}
                    </lead>
                </div>
            </div>
        `;
    }

    const projectData = await loadData('project.json');
    for (var i = 0; i < projectData.length; i++) {
        project.innerHTML += `
            <div class="project-item">
                <a href="${projectData[i].url}">
                    <img src="images/${projectData[i].image}.png" alt="${projectData[i].title}" width="60px" height="60px">
                </a>
                <div class="project-item-content">
                    <div class="project-item-content-title">
                        <h3>${projectData[i].title}</h3>
                        <p class="btn btn-outline-warning">${projectData[i].technology}</p>
                    </div>
                    <div class="btn ${getTypeDivBtnStyle(projectData[i].type)} p-0">
                        ${projectData[i].type}
                    </div>
                    <lead>
                        ${projectData[i].description}
                    </lead>
                    ${getSrcLinkHTML(projectData[i].source)}
                </div>
            </div>
        `;
    }
}

async function loadData(jsonFileName) {
    const response = await fetch(`data/${jsonFileName}`)
    const jsondata = await response.json();
    return jsondata;
}

function getTypeDivBtnStyle(type) {
    let typeDivBtnStyle = '';
    if (type === 'Contributed') {
        typeDivBtnStyle = 'btn-outline-primary';
    } else if (type === 'Published') {
        typeDivBtnStyle = 'btn-outline-success';
    } else if (type === 'Personal') {
        typeDivBtnStyle = 'btn-outline-secondary';
    } else if (type === 'University') {
        typeDivBtnStyle = 'btn-outline-danger';
    }
    return typeDivBtnStyle;
}

function getSrcLinkHTML(source) {
    if (source === "")
        return "";
    else {
        return `
                    <a href="${source}">
                        Source code
                    </a>
                `;
    }
}