// gradvault-build:6
// Search, filters, and pagination for the Browse page.
// The projects are static cards for now. With the backend, this will call an API with the same filters.
const PAGE_SIZE = 6;

const $ = (id) => document.getElementById(id);
const cards = Array.from(document.querySelectorAll("#browseGrid .project"));
let page = 1;

const controls = {
    q: $("q"),
    category: $("fCategory"),
    department: $("fDepartment"),
    supervisor: $("fSupervisor"),
    year: $("fYear"),
};

function matches(card) {
    const q = controls.q.value.trim().toLowerCase();
    const text = (card.textContent + " " + card.dataset.category).toLowerCase();
    return (
        (!q || text.includes(q)) &&
        (!controls.category.value || card.dataset.category === controls.category.value) &&
        (!controls.department.value || card.dataset.department === controls.department.value) &&
        (!controls.supervisor.value || card.dataset.supervisor === controls.supervisor.value) &&
        (!controls.year.value || card.dataset.year === controls.year.value)
    );
}

function pageButton(label, target, opts = {}) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (opts.aria) b.setAttribute("aria-label", opts.aria);
    if (opts.current) b.setAttribute("aria-current", "page");
    b.disabled = Boolean(opts.disabled);
    b.addEventListener("click", () => { page = target; render(true); });
    return b;
}

function render(scroll) {
    const found = cards.filter(matches);
    const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
    page = Math.min(page, pages);

    const start = (page - 1) * PAGE_SIZE;
    const visible = new Set(found.slice(start, start + PAGE_SIZE));
    cards.forEach((c) => { c.hidden = !visible.has(c); });

    $("browseEmpty").classList.toggle("show", found.length === 0);
    $("resultCount").textContent = found.length
        ? "Showing " + (start + 1) + "-" + (start + visible.size) + " of " + found.length + " projects"
        : "";

    const pager = $("pager");
    pager.replaceChildren();
    if (pages > 1) {
        pager.appendChild(pageButton("Previous", page - 1, { disabled: page === 1 }));
        for (let p = 1; p <= pages; p++) {
            pager.appendChild(pageButton(String(p), p, { current: p === page, aria: "Page " + p }));
        }
        pager.appendChild(pageButton("Next", page + 1, { disabled: page === pages }));
    }

    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function update() { page = 1; render(false); }

Object.values(controls).forEach((el) => el.addEventListener("input", update));
$("filters").addEventListener("submit", update);
$("reset").addEventListener("click", () => {
    Object.values(controls).forEach((el) => { el.value = ""; });
    update();
});

// Values coming from the landing page or the topbar search on other pages
const params = new URLSearchParams(location.search);
if (params.get("q")) controls.q.value = params.get("q");
if (params.get("category")) controls.category.value = params.get("category");

render(false);
