// gradvault-build:6
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");
const loginBtn = document.getElementById("loginBtn");
const toggleBtn = document.getElementById("togglePassword");

// Show / hide password
toggleBtn.addEventListener("click", () => {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    toggleBtn.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

function setError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.toggle("invalid", Boolean(message));
}

function validate() {
    let ok = true;

    const email = emailInput.value.trim();
    if (!email) {
        setError(emailInput, emailError, "Enter your email.");
        ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(emailInput, emailError, "Enter a valid email, like name@student.birzeit.edu.");
        ok = false;
    } else {
        setError(emailInput, emailError, "");
    }

    if (!passwordInput.value) {
        setError(passwordInput, passwordError, "Enter your password.");
        ok = false;
    } else {
        setError(passwordInput, passwordError, "");
    }

    return ok;
}

// Clear an error as soon as the user starts fixing it
emailInput.addEventListener("input", () => setError(emailInput, emailError, ""));
passwordInput.addEventListener("input", () => setError(passwordInput, passwordError, ""));

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMessage.textContent = "";

    if (!validate()) return;

    loginBtn.disabled = true;
    loginBtn.classList.add("loading");

    try {
        // TODO: connect to the backend (PHP) when it is ready, for example:
        // const res = await fetch("api/login.php", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //         email: emailInput.value.trim(),
        //         password: passwordInput.value
        //     })
        // });
        // const data = await res.json();
        // if (!res.ok) throw new Error(data.message || "Login failed.");
        // window.location.href = "dashboard.html";

        await new Promise((resolve) => setTimeout(resolve, 800)); // placeholder delay
        formMessage.textContent = "The server is not connected yet.";
    } catch (err) {
        formMessage.textContent = err.message || "Something went wrong. Try again.";
    } finally {
        loginBtn.disabled = false;
        loginBtn.classList.remove("loading");
    }
});
