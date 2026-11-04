// gradvault-build:6
// Profile page. Needs manage.js loaded first (uses $ and toast).
function fieldError(id, message) {
    $(id + "Err").textContent = message;
    $(id).classList.toggle("invalid", Boolean(message));
}

["fullName", "currentPassword", "newPassword", "confirmNewPassword"].forEach((id) =>
    $(id).addEventListener("input", () => fieldError(id, ""))
);

$("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("fullName").value.trim().length < 3) {
        fieldError("fullName", "Enter your full name.");
        return;
    }
    // TODO: save with fetch("api/update_profile.php", ...)
    toast("Profile updated");
});

$("passwordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const current = $("currentPassword").value;
    const next = $("newPassword").value;
    let ok = true;

    if (!current) { fieldError("currentPassword", "Enter your current password."); ok = false; }

    if (next.length < 8) { fieldError("newPassword", "Password must be at least 8 characters."); ok = false; }
    else if (!/\d/.test(next) || !/[A-Za-z]/.test(next)) { fieldError("newPassword", "Use both letters and numbers."); ok = false; }
    else if (next === current) { fieldError("newPassword", "The new password must be different."); ok = false; }

    if ($("confirmNewPassword").value !== next) { fieldError("confirmNewPassword", "Passwords do not match."); ok = false; }
    if (!ok) return;

    // TODO: verify the current password on the server, then update it with password_hash()
    e.target.reset();
    toast("Password updated");
});
