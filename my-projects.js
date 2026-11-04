// gradvault-build:6
// "My Project" page. The server decides which state the student is in:
// no project yet, pending, rejected, or published.
// DEMO: try the other states with my-projects.html?status=rejected, ?status=published, or ?empty=1
const params = new URLSearchParams(location.search);

if (params.has("empty")) {
    document.getElementById("projectView").hidden = true;
    document.getElementById("noProject").hidden = false;
}

const states = {
    pending: {
        badge: "pending",
        label: "Pending review",
        banner: "info",
        text: "Your project is waiting for the administrator to review its category. You will get a notification when it is published.",
        actions: [["Send a request", "my-requests.html", "btn ghost lg"]],
    },
    rejected: {
        badge: "rejected",
        label: "Rejected",
        banner: "warn",
        text: "Rejected on 10/02/2026. Reason: the abstract is too short. Add more detail and resubmit.",
        actions: [["Edit and resubmit", "edit-project.html", "btn lg"]],
    },
    published: {
        badge: "published",
        label: "Published",
        banner: "info",
        text: "Your project is published and visible to everyone.",
        actions: [
            ["Request a change", "my-requests.html", "btn ghost lg"],
            ["View public page", "project.html", "btn lg"],
        ],
    },
};

const state = states[params.get("status")] || states.pending;

const badge = document.getElementById("statusBadge");
badge.className = "badge " + state.badge;
badge.textContent = state.label;

const banner = document.getElementById("statusBanner");
banner.className = "banner " + state.banner;
banner.textContent = state.text;

const actions = document.getElementById("projectActions");
state.actions.forEach(([label, href, cls]) => {
    const a = document.createElement("a");
    a.href = href;
    a.className = cls;
    a.textContent = label;
    actions.appendChild(a);
});
