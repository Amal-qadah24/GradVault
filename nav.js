// gradvault-build:6
// Shared behavior for every page that has the sidebar:
// mobile menu button, notifications (top right), profile menu with Log out, and topbar search redirect.
(function () {
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".main");
    if (!sidebar || !main) return;

    const isAdmin = Boolean(sidebar.querySelector('a[href="manage-users.html"]'));
    const svg = (paths, size) =>
        '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";

    const ICONS = {
        bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        project: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
        request: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
        user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
        chevron: '<path d="m18 15-6-6-6 6"/>',
        profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
        menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    };

    /* ----- Mobile menu ----- */
    const menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "menu-btn";
    menuBtn.setAttribute("aria-label", "Open menu");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.innerHTML = svg(ICONS.menu);

    const scrim = document.createElement("div");
    scrim.className = "scrim";

    function setMenu(open) {
        sidebar.classList.toggle("open", open);
        scrim.classList.toggle("show", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    menuBtn.addEventListener("click", () => setMenu(!sidebar.classList.contains("open")));
    scrim.addEventListener("click", () => setMenu(false));
    sidebar.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.body.append(menuBtn, scrim);

    /* ----- Profile menu (Profile + Log out) ----- */
    const user = sidebar.querySelector(".user");
    let closeUserMenu = () => {};
    if (user) {
        const wrap = document.createElement("div");
        wrap.className = "user-wrap";
        user.parentNode.insertBefore(wrap, user);
        wrap.appendChild(user);

        user.setAttribute("role", "button");
        user.setAttribute("tabindex", "0");
        user.setAttribute("aria-haspopup", "menu");
        user.setAttribute("aria-expanded", "false");
        user.insertAdjacentHTML("beforeend", '<span class="chev">' + svg(ICONS.chevron, 18) + "</span>");

        const menu = document.createElement("div");
        menu.className = "user-menu";
        menu.setAttribute("role", "menu");
        menu.hidden = true;
        menu.innerHTML =
            '<a href="profile.html" role="menuitem">' + svg(ICONS.profile, 18) + "Profile</a>" +
            "<hr>" +
            // TODO: point this to api/logout.php so the session is destroyed on the server
            '<a href="Gradvaulte.html" role="menuitem" class="danger">' + svg(ICONS.logout, 18) + "Log out</a>";
        wrap.appendChild(menu);

        const setUserMenu = (open) => {
            menu.hidden = !open;
            user.setAttribute("aria-expanded", String(open));
        };
        closeUserMenu = () => setUserMenu(false);

        user.addEventListener("click", () => setUserMenu(menu.hidden));
        user.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setUserMenu(menu.hidden); }
        });
        document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) setUserMenu(false); });
    }

    /* ----- Notifications (top right) ----- */
    let top = main.querySelector(".topbar");
    if (!top) {
        top = document.createElement("div");
        top.className = "topbar";
        main.prepend(top);
    }

    // Demo notifications: [title, details, time, type, link]. TODO: load the real ones from the server.
    const items = isAdmin
        ? [
              ["New project waiting for review", "A001 · Handwritten", "10 min ago", "project", "review.html", true],
              ["New request from Razan Yasin", "R001 · Update request", "1 h ago", "request", "requests.html", true],
              ["3 new users registered this week", "Users", "Yesterday", "user", "manage-users.html", false],
          ]
        : [
              ["Your project is waiting for review", "#002 · Handwritten", "10 min ago", "project", "my-projects.html", true],
              ["Your request was approved", "R000 · Category change", "2 days ago", "request", "my-requests.html", true],
              ["Welcome to GradVault", "Upload your project to get started", "3 days ago", "info", "my-projects.html", false],
          ];
    const allLink = isAdmin ? ["View all requests", "requests.html"] : ["View my requests", "my-requests.html"];

    const wrap = document.createElement("div");
    wrap.className = "bell-wrap";
    wrap.innerHTML =
        '<button type="button" class="bell" aria-label="Notifications" aria-expanded="false" aria-haspopup="true">' +
        svg(ICONS.bell) + '<span class="dot"></span></button>' +
        '<div class="notif" hidden>' +
        '<div class="notif-head"><span class="notif-title">Notifications <span class="notif-count"></span></span>' +
        '<button type="button" class="notif-markall">Mark all as read</button></div>' +
        '<ul class="notif-list"></ul>' +
        '<div class="notif-foot"><a href="' + allLink[1] + '">' + allLink[0] + "</a></div></div>";
    top.appendChild(wrap);

    const bell = wrap.querySelector(".bell");
    const dot = wrap.querySelector(".dot");
    const panel = wrap.querySelector(".notif");
    const list = wrap.querySelector(".notif-list");
    const count = wrap.querySelector(".notif-count");
    const markAll = wrap.querySelector(".notif-markall");

    items.forEach(([title, sub, time, type, href, unread]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "notif-item" + (unread ? " unread" : "");
        a.href = href;

        const ico = document.createElement("span");
        ico.className = "notif-ico " + type;
        ico.innerHTML = svg(ICONS[type], 18);

        const text = document.createElement("span");
        const t = document.createElement("span");
        t.className = "notif-text";
        t.textContent = title;
        const s = document.createElement("span");
        s.className = "notif-sub";
        s.textContent = sub;
        text.append(t, s);

        const when = document.createElement("span");
        when.className = "notif-time";
        when.textContent = time;

        a.append(ico, text, when);
        a.addEventListener("click", () => { a.classList.remove("unread"); refresh(); }); // opens the page, and counts as read
        li.appendChild(a);
        list.appendChild(li);
    });

    function refresh() {
        const n = list.querySelectorAll(".unread").length;
        dot.textContent = n;
        dot.hidden = n === 0;
        count.textContent = n + " new";
        count.hidden = n === 0;
        markAll.hidden = n === 0;
        bell.setAttribute("aria-label", n ? "Notifications, " + n + " unread" : "Notifications");
    }
    refresh();

    function setPanel(open) {
        panel.hidden = !open;
        bell.setAttribute("aria-expanded", String(open));
    }

    bell.addEventListener("click", () => { closeUserMenu(); setPanel(panel.hidden); });
    markAll.addEventListener("click", () => {
        list.querySelectorAll(".unread").forEach((el) => el.classList.remove("unread"));
        refresh();
    });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) setPanel(false); });
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!panel.hidden) bell.focus();
        setPanel(false);
        closeUserMenu();
        setMenu(false);
    });

    /* ----- Topbar search sends you to Browse (the Browse page filters by itself) ----- */
    const search = top.querySelector('input[type="search"]');
    if (search && !document.getElementById("browseGrid")) {
        search.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                location.href = "browse.html?q=" + encodeURIComponent(search.value.trim());
            }
        });
    }
})();
