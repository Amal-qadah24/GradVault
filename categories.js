// gradvault-build:6
// Manage Categories. Needs manage.js loaded first (uses $, toast, confirmDialog, applyFilters).
const catRows = $("catRows");
let editingRow = null;

function catName(row) { return row.cells[0].textContent.trim(); }

function nameTaken(name, ignoreRow) {
    return Array.from(catRows.rows).some(
        (r) => r !== ignoreRow && catName(r).toLowerCase() === name.toLowerCase()
    );
}

function bindRow(row) {
    row.querySelector(".edit-cat").addEventListener("click", () => {
        editingRow = row;
        $("editName").value = catName(row);
        $("editDesc").value = row.cells[1].textContent.trim();
        $("editNameErr").textContent = "";
        $("editDlg").showModal();
        $("editName").focus();
    });

    row.querySelector(".delete-cat").addEventListener("click", async () => {
        const name = catName(row);
        const count = Number(row.dataset.count);

        // A category that still has projects cannot be deleted: move the projects first
        if (count > 0) {
            toast(name + " still has " + count + " project" + (count === 1 ? "" : "s") + ". Move them to another category first.");
            return;
        }

        const ok = await confirmDialog("Delete " + name + "?", "This category will be removed permanently.", "Delete");
        if (!ok) return;

        // TODO: delete with fetch("api/delete_category.php", ...)
        row.remove();
        toast(name + " was deleted");
        applyFilters();
    });
}

Array.from(catRows.rows).forEach(bindRow);

/* ----- Add ----- */
$("catName").addEventListener("input", () => {
    $("catNameErr").textContent = "";
    $("catName").classList.remove("invalid");
});

$("catForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("catName").value.trim();
    const desc = $("catDesc").value.trim();

    let error = "";
    if (name.length < 2) error = "Enter a category name.";
    else if (nameTaken(name, null)) error = "This category already exists.";
    if (error) {
        $("catNameErr").textContent = error;
        $("catName").classList.add("invalid");
        return;
    }

    // TODO: save with fetch("api/add_category.php", ...)
    const row = document.createElement("tr");
    row.dataset.count = "0";

    const nameTd = document.createElement("td");
    const strong = document.createElement("strong");
    strong.textContent = name;
    nameTd.appendChild(strong);

    const descTd = document.createElement("td");
    descTd.textContent = desc;

    const countTd = document.createElement("td");
    countTd.textContent = "0";

    const actionsTd = document.createElement("td");
    actionsTd.innerHTML =
        '<div class="row-actions">' +
        '<button class="btn ghost sm edit-cat" type="button">Edit</button>' +
        '<button class="btn danger sm delete-cat" type="button">Delete</button></div>';

    row.append(nameTd, descTd, countTd, actionsTd);
    catRows.appendChild(row);
    bindRow(row);

    $("catForm").reset();
    toast(name + " was added");
    applyFilters();
});

/* ----- Edit ----- */
$("editCancel").addEventListener("click", () => $("editDlg").close());

$("editSave").addEventListener("click", () => {
    const name = $("editName").value.trim();
    if (name.length < 2) { $("editNameErr").textContent = "Enter a category name."; return; }
    if (nameTaken(name, editingRow)) { $("editNameErr").textContent = "This category already exists."; return; }

    // TODO: save with fetch("api/update_category.php", ...)
    editingRow.cells[0].querySelector("strong").textContent = name;
    editingRow.cells[1].textContent = $("editDesc").value.trim();
    $("editDlg").close();
    toast("Category updated");
    applyFilters();
});
