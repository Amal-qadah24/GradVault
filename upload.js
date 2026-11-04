// gradvault-build:6
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const $ = (id) => document.getElementById(id);
const form = $("uploadForm");
const dropzone = $("dropzone");
const fileInput = $("file");
const fileChip = $("fileChip");
const submitBtn = $("submitBtn");

let selectedFile = null;

// Year select: current year and the 5 before it
const yearSelect = $("year");
const thisYear = new Date().getFullYear();
for (let y = thisYear; y > thisYear - 6; y--) {
    yearSelect.add(new Option(y, y));
}

/* ---------- File handling ---------- */
function setFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return showFileError("Only PDF files are allowed.");
    }
    if (file.size > MAX_SIZE) {
        return showFileError("The file is larger than 20 MB.");
    }
    selectedFile = file;
    $("fileName").textContent = file.name + " (" + (file.size / 1024 / 1024).toFixed(1) + " MB)";
    fileChip.classList.add("show");
    dropzone.classList.remove("invalid");
    $("fileErr").textContent = "";
}

function showFileError(msg) {
    selectedFile = null;
    fileInput.value = "";
    fileChip.classList.remove("show");
    dropzone.classList.add("invalid");
    $("fileErr").textContent = msg;
}

fileInput.addEventListener("change", () => setFile(fileInput.files[0]));

["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("over"); })
);
["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("over"); })
);
dropzone.addEventListener("drop", (e) => setFile(e.dataTransfer.files[0]));

$("removeFile").addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    fileChip.classList.remove("show");
});

/* ---------- Validation ---------- */
function validate() {
    let ok = true;
    const check = (id, cond, msg) => {
        const input = $(id);
        const err = $(id + "Err");
        err.textContent = cond ? "" : msg;
        input.classList.toggle("invalid", !cond);
        if (!cond) ok = false;
    };

    check("title", $("title").value.trim().length >= 5, "Enter the project title.");
    check("supervisor", $("supervisor").value.trim().length >= 3, "Enter the supervisor's name.");
    check("department", $("department").value !== "", "Select the department.");
    check("abstract", $("abstract").value.trim().length >= 50, "Write an abstract of at least 50 characters.");

    if (!selectedFile) {
        showFileError("Add your project PDF.");
        ok = false;
    }
    return ok;
}

["title", "supervisor", "department", "abstract"].forEach((id) => {
    $(id).addEventListener("input", () => {
        $(id).classList.remove("invalid");
        $(id + "Err").textContent = "";
    });
});

/* ---------- Upload + classification ---------- */
// DEMO ONLY: fake results so the page works without a backend.
// Replace with a real call to your classifier (CSO Classifier behind a small API), for example:
//   const fd = new FormData();
//   fd.append("title", ...); fd.append("abstract", ...); fd.append("file", selectedFile);
//   fd.append("members", JSON.stringify(getTeamMembers()));  // optional team members
//   const res = await fetch("api/classify.php", { method: "POST", body: fd });
//   return await res.json();   // expected: [{ name: "Machine Learning", score: 0.87 }, ...]
async function classify() {
    await new Promise((r) => setTimeout(r, 900));
    return [
        { name: "Artificial Intelligence", score: 0.87 },
        { name: "Computer Vision", score: 0.64 },
        { name: "Software Engineering", score: 0.41 },
    ];
}

function fakeProgress() {
    const bar = $("progressBar");
    return new Promise((resolve) => {
        let p = 0;
        const timer = setInterval(() => {
            p += 8 + Math.random() * 10;
            if (p >= 100) { p = 100; clearInterval(timer); resolve(); }
            bar.style.width = p + "%";
        }, 160);
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) {
        const first = form.querySelector(".invalid");
        if (first && first.focus) first.focus();
        return;
    }

    submitBtn.disabled = true;
    $("progress").classList.add("show");
    $("progressBar").style.width = "0";
    $("progressText").textContent = "Uploading...";

    try {
        await fakeProgress();
        $("progressText").textContent = "Classifying your project...";
        const predictions = await classify();
        showResults(predictions);
    } catch (err) {
        $("progressText").textContent = "Something went wrong. Try again.";
    } finally {
        submitBtn.disabled = false;
    }
});

/* ---------- Review predicted category ---------- */
function showResults(predictions) {
    const box = $("options");
    box.replaceChildren();

    predictions.forEach((p, i) => {
        const label = document.createElement("label");
        label.className = "option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "category";
        radio.value = p.name;
        radio.checked = i === 0;

        const name = document.createElement("span");
        name.textContent = p.name + (i === 0 ? " (suggested)" : "");

        const pct = document.createElement("span");
        pct.className = "pct";
        pct.textContent = Math.round(p.score * 100) + "%";

        const track = document.createElement("div");
        track.className = "track";
        const fill = document.createElement("i");
        fill.style.width = Math.round(p.score * 100) + "%";
        track.appendChild(fill);

        label.append(radio, name, pct, track);
        box.appendChild(label);
    });

    // "None of these" option
    const other = document.createElement("label");
    other.className = "option";
    const otherRadio = document.createElement("input");
    otherRadio.type = "radio";
    otherRadio.name = "category";
    otherRadio.value = "__other__";
    const otherText = document.createElement("span");
    otherText.textContent = "None of these";
    other.append(otherRadio, otherText);
    box.appendChild(other);

    box.addEventListener("change", () => {
        $("otherWrap").hidden = selectedCategory() !== "__other__";
    });

    $("uploadPanel").hidden = true;
    $("resultPanel").classList.add("show");
    $("resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectedCategory() {
    const checked = document.querySelector('input[name="category"]:checked');
    return checked ? checked.value : "";
}

$("backBtn").addEventListener("click", () => {
    $("resultPanel").classList.remove("show");
    $("uploadPanel").hidden = false;
    $("progress").classList.remove("show");
});

$("confirmBtn").addEventListener("click", () => {
    let category = selectedCategory();
    if (category === "__other__") category = $("otherCategory").value;
    if (!category) {
        $("otherCategory").focus();
        return;
    }

    // TODO: save the project and the confirmed category in the database, for example:
    // await fetch("api/submit_project.php", { method: "POST", body: ... });
    console.log("Confirmed category:", category);

    $("resultPanel").classList.remove("show");
    $("done").classList.add("show");
});
