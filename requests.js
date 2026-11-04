// gradvault-build:6
// Student "My Requests" page. Needs manage.js loaded first (uses $, toast, applyFilters).
const requestForm = $("requestForm");
let nextRequestNumber = 2;

function reqError(id, message) {
    $(id + "Err").textContent = message;
    $(id).classList.toggle("invalid", Boolean(message));
}

["reqType", "reqMessage"].forEach((id) =>
    $(id).addEventListener("input", () => reqError(id, ""))
);

requestForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const type = $("reqType").value;
    const message = $("reqMessage").value.trim();
    let ok = true;

    if (!type) { reqError("reqType", "Select the request type."); ok = false; }
    if (message.length < 10) { reqError("reqMessage", "Describe your request in at least 10 characters."); ok = false; }
    if (!ok) return;

    // TODO: save with fetch("api/create_request.php", ...), then use the ID from the server
    const id = "R" + String(nextRequestNumber++).padStart(3, "0");
    const row = document.createElement("tr");
    row.dataset.status = "pending";

    const cells = [id, type, $("reqProject").value, new Date().toLocaleDateString("en-US")];
    cells.forEach((text) => {
        const td = document.createElement("td");
        td.textContent = text;
        row.appendChild(td);
    });

    const statusTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge pending";
    badge.textContent = "Pending";
    statusTd.appendChild(badge);
    row.appendChild(statusTd);

    $("requestRows").prepend(row);
    requestForm.reset();
    toast("Request " + id + " sent to the administrator");
    applyFilters();
});
