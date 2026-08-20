/* ==========================================================================
   loadsidebar.js - injects sidebar.html into .sidebar, marks the current page
   and wires the mobile menu toggle.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar)
        return;

    try {
        const response = await fetch('/sidebar.html');
        if (!response.ok)
            throw new Error(`${response.status} ${response.statusText}`);
        sidebar.innerHTML = await response.text();
    } catch (error) {
        console.warn('Could not load the sidebar', error);
        return;
    }

    markCurrentPage(sidebar);
    setUpToggle(sidebar);
});

/* Highlights the nav entry for the section being viewed. Blog posts live under
   /blogs/ and interactives under /interactives/, so the section is matched on a
   path prefix rather than an exact URL. */
function markCurrentPage(sidebar) {
    const path = window.location.pathname;

    let best = null;
    let bestLength = -1;

    sidebar.querySelectorAll('.site-nav-link').forEach(link => {
        const match = link.dataset.match;
        const isMatch = match === '/'
            ? (path === '/' || path.endsWith('/index.html'))
            : path.startsWith(match);

        if (isMatch && match.length > bestLength) {
            best = link;
            bestLength = match.length;
        }
    });

    if (best)
        best.setAttribute('aria-current', 'page');
}

function setUpToggle(sidebar) {
    const toggle = sidebar.querySelector('.site-nav-toggle');
    const panel = sidebar.querySelector('.site-nav-panel');
    if (!toggle || !panel)
        return;

    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        panel.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // navigating within the page should not leave the menu covering the content
    panel.addEventListener('click', (event) => {
        if (event.target.closest('a'))
            setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true')
            return;
        setOpen(false);
        toggle.focus();
    });

    // the panel is always visible on desktop, so reset the collapsed state when
    // the viewport grows past the breakpoint
    const wide = window.matchMedia('(min-width: 992px)');
    wide.addEventListener('change', (event) => {
        if (event.matches)
            setOpen(false);
    });
}
