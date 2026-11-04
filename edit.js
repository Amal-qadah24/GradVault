// gradvault-build:6
// Edit / resubmit a rejected project. Needs manage.js loaded first (uses $ and toast).
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const dropzone = $("dropzone");
const fileInput = $("file");

// Year select: current year and the 5 before it
const thisYear = new Date().getFullYear();
for (let y = thisYear; y > thisYear - 6; y--) $("year").add(new Option(y, y));

/* ----- Replacing the file ----- */
function setFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        fileInput.value = "";
        $("fileErr").textContent = "Only PDF files are allowed.";
        return;
    }
    if (file.size > MAX_SIZE) {
        fileInput.value = "";
        $("fileErr").textContent = "The file is larger than 20 MB.";
        return;
    }
    $("fileErr").textContent = "";
    $("fileName").textContent = file.name + " (" + (file.size / 1024 / 1024).toFixed(1) + " MB)";
    document.querySelector("#currentFile span:last-child").textContent = "New file";
}

fileInput.addEventListener("change", () => setFile(fileInput.files[0]));
["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("over"); })
);
["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("over"); })
);
dropzone.addEventListener("drop", (e) => setFile(e.dataTransfer.files[0]));

/* ----- Validation ----- */
function check(id, ok, message) {
    $(id + "Err").textContent = ok ? "" : message;
    $(id).classList.toggle("invalid", !ok);
    return ok;
}

["title", "supervisor", "department", "abstract"].forEach((id) =>
    $(id).addEventListener("input", () => check(id, true, ""))
);

$("editForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const results = [
        check("title", $("title").value.trim().length >= 5, "Enter the project title."),
        check("supervisor", $("supervisor").value.trim().length >= 3, "Enter the supervisor's name."),
        check("department", $("department").value !== "", "Select the department."),
        check("abstract", $("abstract").value.trim().length >= 50, "Write an abstract of at least 50 characters."),
    ];
    if (results.includes(false)) {
        const first = document.querySelector("#editForm .invalid");
        if (first) first.focus();
        return;
    }

    // TODO: send to the server (keep the same project, set its status back to Pending), for example:
    // const fd = new FormData(); fd.append("title", ...); if (fileInput.files[0]) fd.append("file", fileInput.files[0]); fd.append("members", JSON.stringify(getTeamMembers()));
    // await fetch("api/resubmit_project.php", { method: "POST", body: fd });
    $("editPanel").hidden = true;
    $("done").classList.add("show");
    toast("Project resubmitted");
});
