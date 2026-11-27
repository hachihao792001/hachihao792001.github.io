/* ==========================================================================
   concept.js - interactive explainers embedded in the prose.

       <div class="conceptDemo" data-concept="dot-product"
            data-height="330" data-caption="Drag either arrow."></div>

   turns into an iframe of concepts/dot-product.html.

   A concept demo is NOT a rung. It explains a primitive the post uses but
   does not build - a dot product, barycentric coordinates, how TCP splits a
   stream - so it has a NAME, never a version number, and no Diff button:
   there is no previous version to diff against. Keeping them out of the
   numbering is what stops an aside from renumbering the whole ladder.

   Loaded independently of preview.js, because a post whose versions are not
   web pages at all (a Python server, a shader) can still want one of these.

   The file is fetched and injected as srcdoc rather than set as iframe.src,
   so that buildStandalone.py's rewritten fetch() picks it up and the demo
   keeps working in the offline single-file build.
   ========================================================================== */

(async function () {
    const divs = document.querySelectorAll(".conceptDemo");

    for (const div of divs) {
        const name = div.dataset.concept;
        if (!name) {
            console.warn("conceptDemo with no data-concept", div);
            continue;
        }

        const frame = document.createElement("iframe");
        frame.className = "conceptFrame";
        frame.style.height = (div.dataset.height || 330) + "px";
        frame.setAttribute("title", div.dataset.title || ("Interactive demo: " + name));
        frame.setAttribute("scrolling", "no");
        div.appendChild(frame);

        try {
            const res = await fetch("concepts/" + name + ".html");
            if (!res.ok) throw new Error(res.status + " " + res.statusText);
            frame.srcdoc = await res.text();
        } catch (e) {
            console.error("concept demo failed to load:", name, e);
            div.classList.add("is-broken");
            frame.remove();
            const msg = document.createElement("div");
            msg.className = "conceptMissing";
            msg.textContent = "(interactive demo “" + name + "” could not be loaded)";
            div.appendChild(msg);
        }

        if (div.dataset.caption) {
            const cap = document.createElement("div");
            cap.className = "conceptCaption";
            cap.textContent = div.dataset.caption;
            div.appendChild(cap);
        }
    }
})();
