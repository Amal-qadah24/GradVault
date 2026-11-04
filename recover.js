// gradvault-build:6
// Handles both forgot-password.html and reset-password.html
const $ = (id) => document.getElementById(id);
const message = $("formMessage");
const submitBtn = $("submitBtn");

function setError(id, text) {
    $(id + "Error").textContent = text;
    $(id).classList.toggle("invalid", Boolean(text));
}

function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.classList.toggle("loading", busy);
}

document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = $(btn.dataset.target);
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
});

document.querySelectorAll("input").forEach((input) =>
    input.addEventListener("input", () => setError(input.id, ""))
);

/* ----- Forgot password ----- */
const forgotForm = $("forgotForm");
if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        message.textContent = "";
        message.classList.remove("ok");

        const email = $("email").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("email", "Enter a valid email, like name@student.birzeit.edu.");
            return;
        }

        setBusy(true);
        try {
            // TODO: call the backend, which creates a token and emails a link to reset-password.html?token=...
            // await fetch("api/forgot_password.php", { method: "POST", ... });
            await new Promise((r) => setTimeout(r, 800)); // placeholder delay

            // Same message whether or not the account exists (does not reveal registered emails)
            message.classList.add("ok");
            message.textContent = "If an account exists for " + email + ", a reset link has been sent.";
        } catch (err) {
            message.textContent = "Something went wrong. Try again.";
        } finally {
            setBusy(false);
        }
    });
}

/* ----- Reset password ----- */
const resetForm = $("resetForm");
if (resetForm) {
    // The reset link will look like reset-password.html?token=...
    const token = new URLSearchParams(location.search).get("token");

    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        message.textContent = "";
        message.classList.remove("ok");

        const pw = $("password").value;
        let ok = true;

        if (pw.length < 8) { setError("password", "Password must be at least 8 characters."); ok = false; }
        else if (!/\d/.test(pw) || !/[A-Za-z]/.test(pw)) { setError("password", "Use both letters and numbers."); ok = false; }

        if ($("confirmPassword").value !== pw) { setError("confirmPassword", "Passwords do not match."); ok = false; }
        if (!ok) return;

        setBusy(true);
        try {
            // TODO: send { token, password } to the backend, which checks the token and expiry,
            // then stores password_hash(). If the token is missing or expired, show an error.
            // await fetch("api/reset_password.php", { method: "POST", body: JSON.stringify({ token, password: pw }) });
            await new Promise((r) => setTimeout(r, 800)); // placeholder delay

            message.classList.add("ok");
            message.textContent = "Password updated. You can now log in.";
            setTimeout(() => { location.href = "Gradvaulte.html"; }, 1500);
        } catch (err) {
            message.textContent = "Something went wrong. Try again.";
        } finally {
            setBusy(false);
        }
    });
}
