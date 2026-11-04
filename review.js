// gradvault-build:6
// Review Classification (admin). Needs manage.js loaded first (uses $, toast, confirmDialog).
function selectedCategory() {
    const checked = document.querySelector('input[name="category"]:checked');
    return checked ? checked.value : "";
}

$("options").addEventListener("change", () => {
    $("otherWrap").hidden = selectedCategory() !== "__other__";
});

$("otherCategory").addEventListener("change", () => { $("otherCategoryErr").textContent = ""; });
$("reason").addEventListener("input", () => {
    $("reasonErr").textContent = "";
    $("reason").classList.remove("invalid");
});

function finish(approved, text) {
    $("categoryPanel").hidden = true;
    $("decisionPanel").hidden = true;

    const badge = $("statusBadge");
    badge.className = "badge " + (approved ? "published" : "rejected");
    badge.textContent = approved ? "Published" : "Rejected";

    const done = $("done");
    done.className = "done show" + (approved ? "" : " bad");
    done.replaceChildren(document.createTextNode(text + " "));
    const link = document.createElement("a");
    link.href = "manage-projects.html";
    link.style.textDecoration = "underline";
    link.textContent = "Back to projects";
    done.appendChild(link);
}

$("approveBtn").addEventListener("click", async () => {
    let category = selectedCategory();
    if (category === "__other__") category = $("otherCategory").value;
    if (!category) {
        $("otherCategoryErr").textContent = "Select a category.";
        $("otherCategory").focus();
        return;
    }

    const ok = await confirmDialog(
        "Approve and publish?",
        'The project will be published under "' + category + '" and the student will be notified.',
        "Approve"
    );
    if (!ok) return;

    // TODO: save with fetch("api/review_project.php", { decision: "approved", category })
    finish(true, 'Approved and published under "' + category + '".');
    toast("Project published");
});

$("rejectBtn").addEventListener("click", async () => {
    const reason = $("reason").value.trim();
    if (reason.length < 10) {
        $("reasonErr").textContent = "Write a reason of at least 10 characters.";
        $("reason").classList.add("invalid");
        $("reason").focus();
        return;
    }

    const ok = await confirmDialog(
        "Reject this project?",
        "The student will see your reason and can resubmit.",
        "Reject"
    );
    if (!ok) return;

    // TODO: save with fetch("api/review_project.php", { decision: "rejected", reason })
    finish(false, "Rejected. The student was notified.");
    toast("Project rejected");
});
