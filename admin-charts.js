// gradvault-build:6
// Admin dashboard charts. The numbers are demo data: replace them with a fetch() to your API later.
(function () {
    if (typeof Chart === "undefined") {
        document.querySelectorAll(".chart-box").forEach((box) => {
            box.textContent = "Charts need an internet connection to load.";
        });
        return;
    }

    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    Chart.defaults.color = "#5d6f7d";

    const common = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
    };

    new Chart(document.getElementById("catChart"), {
        type: "bar",
        data: {
            labels: ["Artificial Intelligence", "Software Engineering", "Computer Vision", "Networking", "Security", "Databases"],
            datasets: [{ data: [42, 25, 21, 18, 12, 10], backgroundColor: "#26828b", borderRadius: 6, barThickness: 18 }],
        },
        options: {
            ...common,
            indexAxis: "y",
            scales: {
                x: { beginAtZero: true, grid: { color: "#e8eef2" }, ticks: { precision: 0 } },
                y: { grid: { display: false } },
            },
        },
    });

    new Chart(document.getElementById("yearChart"), {
        type: "bar",
        data: {
            labels: ["2022", "2023", "2024", "2025", "2026"],
            datasets: [{ data: [14, 19, 27, 36, 32], backgroundColor: "#5ed3e3", borderRadius: 6, maxBarThickness: 44 }],
        },
        options: {
            ...common,
            scales: {
                y: { beginAtZero: true, grid: { color: "#e8eef2" }, ticks: { precision: 0 } },
                x: { grid: { display: false } },
            },
        },
    });
})();
