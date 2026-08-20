/* ==========================================================================
   ui.js - small shared UI behaviours, loaded on every page.

   Everything here is progressive enhancement: with JavaScript disabled the
   pages stay fully readable and navigable.
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Only opt into the reveal animation when motion is welcome. The class gates
   the CSS, so adding it late means content is never stuck at opacity 0 if the
   observer never runs. */
if (!prefersReducedMotion.matches)
    document.documentElement.classList.add('js-reveal');

document.addEventListener('DOMContentLoaded', () => {
    observeReveals(document);
    setUpBackToTop();
});

/* --------------------------------------------------------------------------
   Scroll reveal
   -------------------------------------------------------------------------- */

let revealObserver = null;

function getRevealObserver() {
    if (revealObserver || !('IntersectionObserver' in window))
        return revealObserver;

    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting)
                return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    return revealObserver;
}

// call again after injecting cards so the new nodes animate in too
function observeReveals(root) {
    const targets = root.querySelectorAll('.reveal:not(.is-visible)');

    const observer = getRevealObserver();
    if (!observer) {
        // no IntersectionObserver: show everything straight away
        targets.forEach(target => target.classList.add('is-visible'));
        return;
    }

    targets.forEach(target => observer.observe(target));
}

/* --------------------------------------------------------------------------
   Back to top - only appears once there is somewhere to go back to
   -------------------------------------------------------------------------- */

function setUpBackToTop() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
    `;
    // hidden from the tab order until it is actually usable
    button.tabIndex = -1;

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });
        // move focus somewhere sensible after the jump
        const firstHeading = document.querySelector('main h1');
        if (firstHeading) {
            firstHeading.setAttribute('tabindex', '-1');
            firstHeading.focus({ preventScroll: true });
        }
    });

    document.body.appendChild(button);

    let queued = false;
    const update = () => {
        queued = false;
        const show = window.scrollY > window.innerHeight * 0.6;
        button.classList.toggle('is-visible', show);
        button.tabIndex = show ? 0 : -1;
    };

    window.addEventListener('scroll', () => {
        if (queued)
            return;
        queued = true;
        requestAnimationFrame(update);
    }, { passive: true });

    update();
}
