// gradvault-build:6
const form = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const formMessage = document.getElementById("formMessage");

const fields = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    studentId: document.getElementById("studentId"),
    department: document.getElementById("department"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
};

function setError(name, message) {
    const input = fields[name];
    document.getElementById(name + "Error").textContent = message;
    input.classList.toggle("invalid", Boolean(message));
}

// Show / hide password (works for both password fields)
document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
});

// Password strength: 0 to 4
function strengthScore(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

const strengthEl = document.getElementById("strength");
const strengthText = document.getElementById("strengthText");
const labels = ["", "Weak", "Fair", "Good", "Strong"];

fields.password.addEventListener("input", () => {
    const pw = fields.password.value;
    const score = pw ? Math.max(1, strengthScore(pw)) : 0;
    strengthEl.dataset.level = score;
    strengthText.textContent = score ? "Strength: " + labels[score] : "";
});

// Clear an error as soon as the user edits the field
Object.keys(fields).forEach((name) => {
    fields[name].addEventListener("input", () => setError(name, ""));
    fields[name].addEventListener("change", () => setError(name, ""));
});

function validate() {
    let ok = true;
    const fail = (name, msg) => { setError(name, msg); ok = false; };

    if (fields.fullName.value.trim().length < 3) fail("fullName", "Enter your full name.");
    else setError("fullName", "");

    const email = fields.email.value.trim();
    if (!email) fail("email", "Enter your email.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("email", "Enter a valid email, like name@student.birzeit.edu.");
    else setError("email", "");

    // Assumes 7-digit student IDs (like the ones in university emails). Edit if yours differ.
    if (!/^\d{7}$/.test(fields.studentId.value.trim())) fail("studentId", "Student ID must be 7 digits.");
    else setError("studentId", "");

    if (!fields.department.value) fail("department", "Select your department.");
    else setError("department", "");

    const pw = fields.password.value;
    if (pw.length < 8) fail("password", "Password must be at least 8 characters.");
    else if (!/\d/.test(pw) || !/[A-Za-z]/.test(pw)) fail("password", "Use both letters and numbers.");
    else setError("password", "");

    if (!fields.confirmPassword.value) fail("confirmPassword", "Re-enter your password.");
    else if (fields.confirmPassword.value !== pw) fail("confirmPassword", "Passwords do not match.");
    else setError("confirmPassword", "");

    return ok;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMessage.textContent = "";

    if (!validate()) {
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    registerBtn.disabled = true;
    registerBtn.classList.add("loading");

    try {
        // TODO: connect to the backend (PHP) when it is ready, for example:
        // const res = await fetch("api/register.php", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //         fullName: fields.fullName.value.trim(),
        //         email: fields.email.value.trim(),
        //         studentId: fields.studentId.value.trim(),
        //         department: fields.department.value,
        //         password: fields.password.value
        //     })
        // });
        // const data = await res.json();
        // if (!res.ok) throw new Error(data.message || "Registration failed.");
        // window.location.href = "Gradvaulte.html";

        await new Promise((resolve) => setTimeout(resolve, 800)); // placeholder delay
        formMessage.textContent = "The server is not connected yet.";
    } catch (err) {
        formMessage.textContent = err.message || "Something went wrong. Try again.";
    } finally {
        registerBtn.disabled = false;
        registerBtn.classList.remove("loading");
    }
});
