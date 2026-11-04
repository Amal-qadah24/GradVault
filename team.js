// gradvault-build:6
// Optional team members for upload.html and edit-project.html.
// A project can have one student or several. Other students are added by student ID.
(function () {
    const section = document.getElementById("teamSection");
    if (!section) return;

    const OWN_ID = "1221001";       // TODO: the logged-in student's ID, from the session
    const MAX_ADDITIONAL = 3;       // how many other students can be added (change if your rule is different)

    // DEMO ONLY: a fake student directory so the page can be tried without a backend.
    // TODO: replace lookup() with fetch("api/find_student.php?id=...") that returns { id, name } or 404.
    const directory = {
        "1221002": "Lina Hamdan",
        "1221003": "Omar Khalil",
        "1221004": "Nour Haddad",
        "1221005": "Yousef Saleh",
        "1221006": "Maya Ibrahim",
    };
    async function lookup(id) {
        return directory[id] || null;
    }

    const input = document.getElementById("memberId");
    const addBtn = document.getElementById("addMember");
    const list = document.getElementById("memberList");
    const err = document.getElementById("memberErr");
    const members = new Map(); // student ID -> name

    function setError(message) {
        err.textContent = message;
        input.classList.toggle("invalid", Boolean(message));
    }

    function render() {
        list.querySelectorAll("li:not(.owner)").forEach((li) => li.remove());
        members.forEach((name, id) => {
            const li = document.createElement("li");

            const label = document.createElement("span");
            label.textContent = name + " ";
            const small = document.createElement("small");
            small.textContent = "· " + id;
            label.appendChild(small);

            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "Remove";
            remove.setAttribute("aria-label", "Remove " + name);
            remove.addEventListener("click", () => { members.delete(id); render(); });

            li.append(label, remove);
            list.appendChild(li);
        });
    }

    async function addMember() {
        const id = input.value.trim();
        setError("");

        if (!/^\d{7}$/.test(id)) return setError("Student ID must be 7 digits.");
        if (id === OWN_ID) return setError("You are already part of this project.");
        if (members.has(id)) return setError("This student is already added.");
        if (members.size >= MAX_ADDITIONAL) return setError("You can add up to " + MAX_ADDITIONAL + " other students.");

        addBtn.disabled = true;
        try {
            const name = await lookup(id);
            if (!name) return setError("No student found with this ID.");
            members.set(id, name);
            render();
            input.value = "";
            input.focus();
        } catch (e) {
            setError("Could not check this ID. Try again.");
        } finally {
            addBtn.disabled = false;
        }
    }

    addBtn.addEventListener("click", addMember);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); addMember(); } // Enter adds the student, it does not submit the form
    });
    input.addEventListener("input", () => setError(""));

    // Members that already exist (edit page): data-members="1221002:Lina Hamdan,1221003:Omar Khalil"
    (section.dataset.members || "").split(",").filter(Boolean).forEach((pair) => {
        const [id, ...name] = pair.split(":");
        members.set(id.trim(), name.join(":").trim());
    });
    render();

    window.getTeamMembers = () => Array.from(members, ([id, name]) => ({ id, name }));
})();
