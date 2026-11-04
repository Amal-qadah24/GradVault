// gradvault-build:6
const $ = (id) => document.getElementById(id);
const rows = () => Array.from(document.querySelectorAll("tbody tr"));

/* ---------- Toast ---------- */
let toastTimer;
function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ---------- Confirm dialog ---------- */
function confirmDialog(title, text, yesLabel) {
    const dlg = $("confirm");
    $("confirmTitle").textContent = title;
    $("confirmText").textContent = text;
    $("confirmYes").textContent = yesLabel || "Confirm";
    dlg.showModal();

    return new Promise((resolve) => {
        const done = (value) => {
            dlg.close();
            $("confirmYes").onclick = null;
            $("confirmNo").onclick = null;
            dlg.onclose = null;
            resolve(value);
        };
        $("confirmYes").onclick = () => done(true);
        $("confirmNo").onclick = () => done(false);
        dlg.onclose = () => done(false); // Esc key
    });
}

/* ---------- Search + filters ---------- */
// Searchable text = cells that do not contain controls (select, button, link)
function searchText(row) {
    return Array.from(row.cells)
        .filter((td) => !td.querySelector("select, button, a"))
        .map((td) => td.textContent)
        .join(" ")
        .toLowerCase();
}

function applyFilters() {
    const q = $("search").value.trim().toLowerCase();
    const status = $("statusFilter") ? $("statusFilter").value : "";
    const role = $("roleFilter") ? $("roleFilter").value : "";
    let visible = 0;

    rows().forEach((row) => {
        const show =
            (!q || searchText(row).includes(q)) &&
            (!status || row.dataset.status === status) &&
            (!role || row.dataset.role === role);
        row.hidden = !show;
        if (show) visible++;
    });

    $("count").textContent = visible + (visible === 1 ? " result" : " results");
    $("empty").classList.toggle("show", visible === 0);
}

["search", "statusFilter", "roleFilter"].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("input", applyFilters);
});

/* ---------- Status badge helper ---------- */
function setBadge(row, status, label) {
    row.dataset.status = status;
    const badge = row.querySelector(".badge");
    badge.className = "badge " + status;
    badge.textContent = label;
}

/* ---------- Users page ---------- */
document.querySelectorAll(".role-select").forEach((select) => {
    select.addEventListener("change", () => {
        const row = select.closest("tr");
        const name = row.querySelector("strong").textContent;
        row.dataset.role = select.value;
        // TODO: save with fetch("api/update_role.php", ...)
        toast(name + " is now " + select.value);
        applyFilters();
    });
});

document.querySelectorAll(".toggle-user").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const row = btn.closest("tr");
        const name = row.querySelector("strong").textContent;
        const disabling = row.dataset.status === "active";

        if (disabling) {
            const ok = await confirmDialog(
                "Disable " + name + "?",
                "They will not be able to log in until you enable the account again.",
                "Disable"
            );
            if (!ok) return;
        }

        // TODO: save with fetch("api/toggle_user.php", ...)
        setBadge(row, disabling ? "disabled" : "active", disabling ? "Disabled" : "Active");
        btn.textContent = disabling ? "Enable" : "Disable";
        btn.className = "btn sm toggle-user " + (disabling ? "ghost" : "danger");
        toast(name + (disabling ? " was disabled" : " was enabled"));
        applyFilters();
    });
});

/* ---------- Requests page (admin) ---------- */
document.querySelectorAll(".decide-request").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const row = btn.closest("tr");
        const id = row.cells[0].textContent;
        const approve = btn.dataset.decision === "approved";

        if (!approve) {
            const ok = await confirmDialog(
                "Reject request " + id + "?",
                "The student will be notified that the request was rejected.",
                "Reject"
            );
            if (!ok) return;
        }

        // TODO: save with fetch("api/decide_request.php", ...)
        setBadge(row, approve ? "approved" : "rejected", approve ? "Approved" : "Rejected");
        btn.closest(".row-actions").querySelectorAll(".decide-request").forEach((b) => b.remove());
        toast("Request " + id + (approve ? " approved" : " rejected"));
        applyFilters();
    });
});

document.querySelectorAll(".view-request").forEach((btn) => {
    btn.addEventListener("click", () => {
        const row = btn.closest("tr");
        const heads = Array.from(document.querySelectorAll("thead th"));
        const list = $("detailList");
        list.replaceChildren();
        $("detailTitle").textContent = "Request " + row.cells[0].textContent;

        for (let i = 1; i < row.cells.length - 1; i++) {
            const wrap = document.createElement("div");
            const dt = document.createElement("dt");
            const dd = document.createElement("dd");
            dt.textContent = heads[i].textContent;
            dd.textContent = row.cells[i].textContent.trim();
            wrap.append(dt, dd);
            list.appendChild(wrap);
        }
        if (row.dataset.message) {
            const wrap = document.createElement("div");
            const dt = document.createElement("dt");
            const dd = document.createElement("dd");
            dt.textContent = "Message";
            dd.textContent = row.dataset.message;
            wrap.append(dt, dd);
            list.appendChild(wrap);
        }
        $("detail").showModal();
    });
});
if ($("detailClose")) $("detailClose").addEventListener("click", () => $("detail").close());

/* ---------- Projects page ---------- */
document.querySelectorAll(".toggle-publish").forEach((btn) => {
    btn.addEventListener("click", () => {
        const row = btn.closest("tr");
        const title = row.cells[1].textContent;
        const publishing = row.dataset.status !== "published";

        // TODO: save with fetch("api/toggle_publish.php", ...)
        setBadge(row, publishing ? "published" : "unpublished", publishing ? "Published" : "Unpublished");
        btn.textContent = publishing ? "Unpublish" : "Publish";
        btn.className = "btn sm toggle-publish " + (publishing ? "ghost" : "");
        toast('"' + title + '" was ' + (publishing ? "published" : "unpublished"));
        applyFilters();
    });
});

document.querySelectorAll(".delete-project").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const row = btn.closest("tr");
        const title = row.cells[1].textContent;
        const ok = await confirmDialog(
            "Delete this project?",
            '"' + title + '" and its PDF will be removed permanently.',
            "Delete"
        );
        if (!ok) return;

        // TODO: delete with fetch("api/delete_project.php", ...)
        row.remove();
        toast("Project deleted");
        applyFilters();
    });
});

if ($("search")) applyFilters();
