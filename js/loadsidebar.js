/* ==========================================================================
   loadsidebar.js - injects sidebar.html into .sidebar, marks the current page
   and wires the mobile menu toggle and the desktop collapse button.
   ========================================================================== */

const COLLAPSED_KEY = 'sidebarCollapsed';
const COLLAPSED_CLASS = 'sidebar-collapsed';
const ANIMATING_CLASS = 'sidebar-animating';

// applied before the sidebar is fetched so the content column does not jump
// from narrow to wide once it lands
document.documentElement.classList.toggle(COLLAPSED_CLASS, readCollapsed());

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
    setUpCollapse(sidebar);
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

/* Desktop only: shrinks the rail down to its icons. The choice is remembered
   across pages, the CSS ignores it below the breakpoint. The width only
   animates while sidebar-animating is set, so restoring the saved state on page
   load snaps straight into place. */
function setUpCollapse(sidebar) {
    const button = sidebar.querySelector('.site-nav-collapse');
    if (!button)
        return;

    const links = sidebar.querySelectorAll('.site-nav-link');

    const setCollapsed = (collapsed) => {
        document.documentElement.classList.toggle(COLLAPSED_CLASS, collapsed);
        button.setAttribute('aria-expanded', String(!collapsed));
        button.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
        button.title = button.getAttribute('aria-label');

        // with the labels hidden, a tooltip is the only way to tell the icons apart
        links.forEach(link => {
            if (collapsed)
                link.title = link.textContent.trim();
            else
                link.removeAttribute('title');
        });
    };

    setCollapsed(readCollapsed());

    let settleTimer = 0;
    const settle = () => {
        clearTimeout(settleTimer);
        document.documentElement.classList.remove(ANIMATING_CLASS);
    };

    sidebar.addEventListener('transitionend', (event) => {
        if (event.target === sidebar && event.propertyName === 'width')
            settle();
    });

    button.addEventListener('click', () => {
        const collapsed = !document.documentElement.classList.contains(COLLAPSED_CLASS);

        document.documentElement.classList.add(ANIMATING_CLASS);
        setCollapsed(collapsed);
        // backstop for when transitionend never comes: the width did not
        // actually change, or the tab is in the background and not rendering
        clearTimeout(settleTimer);
        settleTimer = setTimeout(settle, 600);

        try {
            localStorage.setItem(COLLAPSED_KEY, String(collapsed));
        } catch {
            // storage blocked, the state just will not carry over to the next page
        }
    });
}

function readCollapsed() {
    try {
        return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
        return false;
    }
}
