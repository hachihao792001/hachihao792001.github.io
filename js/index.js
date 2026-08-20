const experienceList = document.querySelector('.experience-list');
const projectList = document.querySelector('.project-list');
const projectToolbar = document.querySelector('#projectToolbar');
const projectCount = document.querySelector('#projectCount');
const projectEmpty = document.querySelector('#projectEmpty');

/* the order the type filters are offered in, most professional first */
const TYPE_ORDER = ['Contributed', 'Published', 'Personal', 'University'];

window.onload = async () => {
    const [experienceData, projectData] = await Promise.all([
        loadData('experience.json'),
        loadData('projects.json')
    ]);

    renderExperience(experienceData);
    await renderProjects(projectData);
};

/* ==========================================================================
   Experience
   ========================================================================== */

function renderExperience(experienceData) {
    experienceList.innerHTML = experienceData.map(item => `
        <article class="experience-item card-surface reveal">
            ${getExperienceLogoHTML(item)}
            <div class="experience-item-content">
                <h3>${getExperienceTitleHTML(item)}</h3>
                <p class="experience-period">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <span>${item.period}</span>
                </p>
                <p>${item.description}</p>
            </div>
        </article>
    `).join('');

    observeReveals(experienceList);
}

/* the logo is decorative next to the title link, so it is only wrapped in an
   anchor when there is a real destination, and it is hidden from the
   accessibility tree to avoid announcing the same link twice */
function getExperienceLogoHTML(item) {
    const image = `
        <img src="${item.image}" alt="" width="52" height="52" loading="lazy" decoding="async">
    `;

    return hasLink(item.url)
        ? `<a class="experience-logo" href="${item.url}" target="_blank" rel="noopener noreferrer" tabindex="-1"
                aria-hidden="true">${image}</a>`
        : `<span class="experience-logo">${image}</span>`;
}

function getExperienceTitleHTML(item) {
    if (!hasLink(item.url))
        return item.title;

    return `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">
            ${item.title}<span class="visually-hidden"> (opens in a new tab)</span>
        </a>
    `;
}

/* ==========================================================================
   Projects
   ========================================================================== */

async function renderProjects(projectData) {
    // A project can provide its own card content through the "html" field, the
    // files are fetched up front so that the cards still show up in JSON order
    const customHTMLs = await Promise.all(projectData.map(p => loadCustomHTML(p.html)));

    projectList.innerHTML = projectData.map((p, i) => `
        <article class="project-item card-surface reveal" data-type="${p.type}"
            data-search="${escapeAttribute(getSearchText(p))}">
            ${customHTMLs[i] === null ? getDefaultProjectHTML(p) : customHTMLs[i]}
        </article>
    `).join('');

    renderProjectToolbar(projectData);
    observeReveals(projectList);
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
        <a class="project-thumb" href="${projectItem.url}" target="_blank" rel="noopener noreferrer"
            tabindex="-1" aria-hidden="true">
            <img src="images/${projectItem.image}.png" alt="" width="60" height="60" loading="lazy" decoding="async">
        </a>
        <div class="project-item-content">
            <h3>
                <a href="${projectItem.url}" target="_blank" rel="noopener noreferrer">
                    ${projectItem.title}<span class="visually-hidden"> (opens in a new tab)</span>
                </a>
            </h3>
            <div class="project-meta">
                <span class="tag ${getTypeTagClass(projectItem.type)}">
                    <span class="tag-dot" aria-hidden="true"></span>${projectItem.type}
                </span>
                <span class="tag tag--tech">${projectItem.technology}</span>
            </div>
            <p>${projectItem.description}</p>
            ${getSrcLinkHTML(projectItem.source, projectItem.title)}
        </div>
    `;
}

function getTypeTagClass(type) {
    if (type === 'Contributed')
        return 'tag--brand';
    if (type === 'Published')
        return 'tag--success';
    if (type === 'Personal')
        return 'tag--neutral';
    if (type === 'University')
        return 'tag--danger';
    return '';
}

function getSrcLinkHTML(source, title) {
    if (!source)
        return '';

    return `
        <a class="project-source" href="${source}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
            </svg>
            Source code<span class="visually-hidden"> for ${title} (opens in a new tab)</span>
        </a>
    `;
}

/* ==========================================================================
   Filter toolbar

   The list is long enough that scanning it top to bottom is the slow way to
   find anything, so the type chips and the search box narrow it down. The
   active filter is mirrored into the URL query so a filtered view can be
   linked to and survives a reload.
   ========================================================================== */

function renderProjectToolbar(projectData) {
    const counts = projectData.reduce((totals, p) => {
        totals[p.type] = (totals[p.type] || 0) + 1;
        return totals;
    }, {});

    const types = TYPE_ORDER.filter(type => counts[type]);
    const params = new URLSearchParams(window.location.search);
    const initialType = types.includes(params.get('type')) ? params.get('type') : 'All';
    const initialQuery = params.get('q') || '';

    projectToolbar.innerHTML = `
        <div class="chip-group" role="group" aria-label="Filter projects by type">
            ${['All', ...types].map(type => `
                <button class="chip" type="button" data-filter="${type}"
                    aria-pressed="${type === initialType}">
                    ${type}
                    <span class="chip-count">${type === 'All' ? projectData.length : counts[type]}</span>
                </button>
            `).join('')}
        </div>

        <div class="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" id="projectSearch" placeholder="Search projects, tech, keywords&hellip;"
                aria-label="Search projects" value="${escapeAttribute(initialQuery)}">
        </div>
    `;

    const chips = [...projectToolbar.querySelectorAll('.chip')];
    const search = projectToolbar.querySelector('#projectSearch');

    const state = { type: initialType, query: initialQuery };

    const apply = () => {
        chips.forEach(chip => {
            chip.setAttribute('aria-pressed', String(chip.dataset.filter === state.type));
        });
        applyProjectFilter(state);
        syncURL(state);
    };

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            state.type = chip.dataset.filter;
            apply();
        });
    });

    search.addEventListener('input', () => {
        state.query = search.value;
        applyProjectFilter(state);
        syncURL(state);
    });

    // without this the empty state is a dead end: the visitor has to work out
    // which of the two filters is hiding everything
    document.querySelector('#projectClear').addEventListener('click', () => {
        state.type = 'All';
        state.query = '';
        search.value = '';
        apply();
        search.focus();
    });

    apply();
}

function applyProjectFilter({ type, query }) {
    const needle = query.trim().toLowerCase();
    const items = projectList.querySelectorAll('.project-item');
    let visible = 0;

    items.forEach(item => {
        const matchesType = type === 'All' || item.dataset.type === type;
        const matchesQuery = !needle || item.dataset.search.includes(needle);
        const show = matchesType && matchesQuery;

        item.hidden = !show;
        if (show) {
            visible++;
            // a card revealed by a filter change should not stay faded out
            item.classList.add('is-visible');
        }
    });

    projectEmpty.hidden = visible > 0;
    projectCount.textContent = visible === items.length
        ? `${items.length} projects`
        : `${visible} of ${items.length} projects`;
}

function syncURL({ type, query }) {
    const params = new URLSearchParams(window.location.search);

    if (type && type !== 'All')
        params.set('type', type);
    else
        params.delete('type');

    if (query.trim())
        params.set('q', query.trim());
    else
        params.delete('q');

    const search = params.toString();
    history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
}

/* ==========================================================================
   Helpers
   ========================================================================== */

async function loadData(jsonFileName) {
    const response = await fetch(`data/${jsonFileName}`);
    return response.json();
}

function hasLink(url) {
    return Boolean(url) && url !== '#';
}

function getSearchText(projectItem) {
    return [
        projectItem.title,
        projectItem.technology,
        projectItem.type,
        projectItem.description
    ].join(' ').toLowerCase();
}

function escapeAttribute(value) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
