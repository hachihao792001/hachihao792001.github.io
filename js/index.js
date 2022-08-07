const experience = document.querySelector('.experience');
const project = document.querySelector('.project');

window.onload = async () => {
    const experienceData = await loadData('experience.json');
    for (var i = 0; i < experienceData.length; i++) {
        experience.innerHTML += `
            <div class="experience-item row">
                <a class="col-12 col-lg-1 me-0 me-md-2 me-lg-2" href="${experienceData[i].url}">
                    <img src="${experienceData[i].image}" alt="${experienceData[i].title}" width="60px" height="60px">
                </a>
                <div class="col-12 col-lg-10 experience-item-content">
                    <h3>${experienceData[i].title}</h3>
                    <h6>${experienceData[i].period}</h6>
                    <lead>
                        ${experienceData[i].description}
                    </lead>
                </div>
            </div>
        `;
    }

    const projectData = await loadData('projects.json');
    for (var i = 0; i < projectData.length; i++) {
        project.innerHTML += `
            <div class="project-item row">
                <a class="col-12 col-lg-1 me-0 me-md-2 me-lg-2" href="${projectData[i].url}">
                    <img src="images/${projectData[i].image}.png" alt="${projectData[i].title}" width="60px" height="60px">
                </a>
                <div class="col-12 col-lg-10 project-item-content">
                    <div class="project-item-content-title row m-0">
                        <h3 class="col-12 col-md-10 col-lg-10 p-0">${projectData[i].title}</h3>
                        <div class="col-5 col-md-2 col-lg-2 
                            project-item-content-title-tech p-0">
                            <div class="btn btn-outline-warning m-0 p-1">
                                ${projectData[i].technology}
                            </div>
                        </div>
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