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

    // A project can provide its own card content through the "html" field, the
    // files are fetched up front so that the cards still show up in JSON order
    const customHTMLs = await Promise.all(projectData.map(p => loadCustomHTML(p.html)));

    project.innerHTML += projectData.map((p, i) => `
            <div class="project-item row">
                ${customHTMLs[i] === null ? getDefaultProjectHTML(p) : customHTMLs[i]}
            </div>
        `).join('');
}

// returns the file's content, or null when there is no custom HTML to use
async function loadCustomHTML(htmlPath) {
    if (!htmlPath)
        return null;

    try {
        const response = await fetch(htmlPath);
        if (!response.ok)
            throw new Error(`${response.status} ${response.statusText}`);
        return await response.text();
    } catch (error) {
        console.warn(`Could not load the custom project HTML "${htmlPath}", falling back to the default card`, error);
        return null;
    }
}

function getDefaultProjectHTML(projectItem) {
    return `
                <a class="col-12 col-lg-1 me-0 me-md-2 me-lg-2" href="${projectItem.url}">
                    <img src="images/${projectItem.image}.png" alt="${projectItem.title}" width="60px" height="60px">
                </a>
                <div class="col-12 col-lg-10 project-item-content">
                    <div class="project-item-content-title row m-0">
                        <h3 class="col-12 col-md-10 col-lg-10 p-0">${projectItem.title}</h3>
                        <div class="col-5 col-md-2 col-lg-2
                            project-item-content-title-tech p-0">
                            <div class="btn btn-outline-warning m-0 p-1">
                                ${projectItem.technology}
                            </div>
                        </div>
                    </div>
                    <div class="btn ${getTypeDivBtnStyle(projectItem.type)} p-0">
                        ${projectItem.type}
                    </div>
                    <lead>
                        ${projectItem.description}
                    </lead>
                    ${getSrcLinkHTML(projectItem.source)}
                </div>
    `;
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