document.addEventListener("DOMContentLoaded", function () {
  
    async function fetchDashboardData(filter) {
        try {
            loadFinancialData();
            console.log("Fetching dashboard data...");

            // Fetch New Customers Today
            const customersResponse = await fetch('https://tikme-dine.onrender.com/api/dine-in/');
            if (!customersResponse.ok) throw new Error("Failed to fetch new customers.");
            const newCustomersData = await customersResponse.json();
            updateTextContent("new-customers", newCustomersData.count || "0");

            // Fetch New Bookings Today
            const bookingsResponse = await fetch('https://tikme-dine.onrender.com/api/event-reservation/');
            if (!bookingsResponse.ok) throw new Error("Failed to fetch new bookings.");
            const newBookingsData = await bookingsResponse.json();
            updateTextContent("new-bookings", newBookingsData.count || "0");

            // Fetch Revenue
            function loadFinancialData() {
                const totalIncomeUrl = "https://capstone-financemanagement.onrender.com/total-income/";
                const totalExpensesUrl = "https://capstone-financemanagement.onrender.com/total-expenses/";
            
                // Fetch Total Revenue (Income)
                const fetchIncome = fetch(totalIncomeUrl)
                    .then(response => response.json())
                    .then(data => data.total_income || 0)
                    .catch(error => {
                        console.error("Error fetching Total Revenue:", error);
                        return 0;
                    });
            
                // Fetch Total Expenses (Includes COGS)
                const fetchExpenses = fetch(totalExpensesUrl)
                    .then(response => response.json())
                    .then(data => data.total_expense || 0)
                    .catch(error => {
                        console.error("Error fetching Total Expenses:", error);
                        return 0;
                    });
            
                // Process all fetch requests together
                Promise.all([fetchIncome, fetchExpenses])
                    .then(([totalRevenue, totalExpenses]) => {
                        // Compute Net Profit = Total Revenue - Total Expenses
                        const netProfit = totalRevenue - totalExpenses;
            
                        // Display Net Profit
                        document.getElementById("net-profit-value").innerText = `₱${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
                    })
                    .catch(error => console.error("Error processing financial data:", error));
            }

            // Fetch Visitor Count
            const visitorsResponse = await fetch('https://tikme-dine.onrender.com/api/get-visitors/');
            if (!visitorsResponse.ok) throw new Error("Failed to fetch visitors.");
            const visitorsData = await visitorsResponse.json();
            updateTextContent("visitors", visitorsData.count || "0");


            // Fetch and update chart data
            const chartResponse = await fetch(`/api/dashboard-data/?filter=${filter}`);
            if (!chartResponse.ok) throw new Error("Failed to fetch dashboard data.");
            const data = await chartResponse.json();

            // Update Charts
            updateChart(bookingsChart, data.chart_labels, data.dine_in_data, data.event_data);
            updateChart(customersChart, data.chart_labels, data.customers_data);
            updateChart(revenueChart, data.chart_labels, data.revenue_data);
            updateChart(visitorsChart, data.chart_labels, data.visitors_data);

            console.log("Dashboard data updated successfully.");
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    }

    function updateTextContent(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with ID '${elementId}' not found.`);
        }
    }

    function updateChart(chart, labels, ...datasets) {
        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets.forEach((dataset, index) => {
                dataset.data = datasets[index] || [];
            });
            chart.update();
        }
    }

    function getCanvas(id) {
        const canvasElement = document.getElementById(id);
        return canvasElement ? canvasElement.getContext("2d") : null;
    }

    // Initialize Charts Only If Elements Exist
    const bookingsChart = getCanvas("chartjs-grouped-bar") ? new Chart(getCanvas("chartjs-grouped-bar"), {
        type: "bar",
        data: { labels: [], datasets: [
            { label: "Dine-In", data: [], backgroundColor: "rgba(54, 162, 235, 0.7)" },
            { label: "Event", data: [], backgroundColor: "rgba(255, 99, 132, 0.7)" }
        ] }
    }) : null;

    const customersChart = getCanvas("chartjs-line") ? new Chart(getCanvas("chartjs-line"), {
        type: "line",
        data: { labels: [], datasets: [{ label: "Customers", data: [], borderColor: "rgba(75, 192, 192, 1)" }] }
    }) : null;

    const revenueChart = getCanvas("chartjs-bar") ? new Chart(getCanvas("chartjs-bar"), {
        type: "bar",
        data: { labels: [], datasets: [{ label: "Revenue", data: [], backgroundColor: "rgba(153, 102, 255, 0.7)" }] }
    }) : null;

    const visitorsChart = getCanvas("chartjs-area") ? new Chart(getCanvas("chartjs-area"), {
        type: "line",
        data: { labels: [], datasets: [{ label: "Visitors", data: [], borderColor: "rgba(255, 159, 64, 1)" }] }
    }) : null;

    // Ensure window.theme is defined before use
    window.theme = window.theme || {
        primary: "#007bff",
        warning: "#ffc107",
        danger: "#dc3545"
    };

    if (getCanvas("chartjs-dashboard-pie")) {
        new Chart(getCanvas("chartjs-dashboard-pie"), {
            type: "pie",
            data: {
                labels: ["Chrome", "Firefox", "IE"],
                datasets: [{
                    data: [4306, 3801, 1689],
                    backgroundColor: [
                        window.theme.primary || "#007bff",
                        window.theme.warning || "#ffc107",
                        window.theme.danger || "#dc3545"
                    ],
                    borderWidth: 5
                }]
            }
        });
    }

    // Load Default Weekly Data
    fetchDashboardData('weekly');

    // Add Event Listeners to Time Filter Buttons
    document.querySelectorAll(".time-filter").forEach(button => {
        button.addEventListener("click", function () {
            fetchDashboardData(this.dataset.filter);
        });
    });
});
