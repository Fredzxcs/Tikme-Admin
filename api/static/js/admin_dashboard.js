document.addEventListener("DOMContentLoaded", function () {
    const chartInstances = {}; // Store chart instances globally
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    async function fetchDashboardData(filter = "weekly", startDate = null, endDate = null) {
        console.log(`Fetching ${filter} dashboard data...`);

        let reportTitle = "Analytics Report - ";

        // Default to current date if no custom date is selected
        if (!startDate || !endDate) {
            const currentDate = new Date();
            startDate = new Date(currentDate);
            endDate = new Date(currentDate);

            if (filter === "weekly") {
                startDate.setDate(currentDate.getDate() - currentDate.getDay());
                reportTitle += `Week of ${formatDate(startDate)}`;
            } else if (filter === "monthly") {
                reportTitle += `Month of ${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`;
            } else {
                reportTitle += `Year ${currentDate.getFullYear()}`;
            }
        } else {
            reportTitle += `From ${formatDate(new Date(startDate))} to ${formatDate(new Date(endDate))}`;
        }

        document.getElementById("report-title").textContent = reportTitle;

        try {
            // Set loading indicators
            setLoadingState();

            // Fetch data from APIs
            const customersData = await fetchData("http://192.168.100.31:8002/api/dine-in/");
            const bookingsData = await fetchData("http://192.168.100.31:8002/api/event-reservation/");
            const visitorsCount = await fetchVisitorCount("http://192.168.100.31:8002/api/get-visitors/");

            // Filter data by date range for reservations only
            const filteredCustomers = filterByDate(customersData, startDate, endDate, "reservation_date");
            const filteredBookings = filterByDate(bookingsData, startDate, endDate, "reservation_date");

            // Update text content
            updateTextContent("new-customers", filteredCustomers.length || "0");
            updateTextContent("new-bookings", filteredBookings.length || "0");
            updateTextContent("visitors", visitorsCount || "0");

            // Update Charts
            updateCharts(filteredBookings, filteredCustomers, visitorsCount);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            displayErrorState();
        }
    }

    // -- NET PROFIT -- //
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

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return [];
        }
    }

    async function fetchVisitorCount(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            const data = await response.json();
            return data.count || 0; // Return only the count
        } catch (error) {
            console.error(`Error fetching visitor count from ${url}:`, error);
            return 0;
        }
    }

    async function fetchFinanceData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            const data = await response.json();
            return data.total || 0;
        } catch (error) {
            console.error(`Error fetching finance data from ${url}:`, error);
            return 0;
        }
    }

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    function filterByDate(data, startDate, endDate, dateField) {
        return data.filter(item => {
            if (!item[dateField]) return false;
            const itemDate = new Date(item[dateField]);
            return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });
    }

    function updateTextContent(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with ID '${elementId}' not found.`);
        }
    }

    function updateCharts(bookings, customers, visitorsCount) {
        updateChart(bookingsChart, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], bookings.map(b => b.total_cost || 0));
        updateChart(customersChart, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], customers.map(c => c.total_bill || 0));
        updateChart(revenueChart, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], bookings.map(b => b.total_cost || 0));
        updateChart(visitorsChart, ["Total Visitors"], [visitorsCount]); // Single bar for visitors count
    }

    function updateChart(chart, labels, data) {
        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
        }
    }

    function initChart(id, type, label, backgroundColor, borderColor) {
        const canvas = document.getElementById(id);
        
        if (!canvas) {
            console.error(`Canvas with ID '${id}' not found.`);
            return null;
        }

        const ctx = canvas.getContext("2d");

        // ✅ Destroy existing chart if it already exists
        if (chartInstances[id]) {
            chartInstances[id].destroy();
        }

        // ✅ Create and store new chart instance
        chartInstances[id] = new Chart(ctx, {
            type: type,
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    data: [],
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        return chartInstances[id];
    }

    function setLoadingState() {
        document.getElementById("new-customers").innerText = "Loading...";
        document.getElementById("new-bookings").innerText = "Loading...";
        document.getElementById("visitors").innerText = "Loading...";
        document.getElementById("net-profit-value").innerText = "Loading...";
    }

    function displayErrorState() {
        document.getElementById("new-customers").innerText = "Error";
        document.getElementById("new-bookings").innerText = "Error";
        document.getElementById("visitors").innerText = "Error";
        document.getElementById("net-profit-value").innerText = "Error";
    }

    // Initialize Charts
    const bookingsChart = initChart("chartjs-grouped-bar", "bar", "Total Bookings", "rgba(78, 115, 223, 0.7)", "#4e73df");
    const customersChart = initChart("chartjs-line", "line", "Total Customers", "rgba(28, 200, 138, 0.7)", "#1cc88a");
    const revenueChart = initChart("chartjs-bar", "bar", "Total Revenue", "rgba(246, 194, 62, 0.7)", "#f6c23e");
    const visitorsChart = initChart("chartjs-visitors-bar", "bar", "Total Visitors", "rgba(231, 74, 59, 0.7)", "#e74a3b");

    // Event listener for time filter buttons
    document.querySelectorAll(".time-filter").forEach(button => {
        button.addEventListener("click", function () {
            fetchDashboardData(this.dataset.filter);
        });
    });

    // Event listener for date range pickers
    startDateInput.addEventListener("change", function () {
        if (startDateInput.value && endDateInput.value) {
            fetchDashboardData("custom", startDateInput.value, endDateInput.value);
        }
    });

    endDateInput.addEventListener("change", function () {
        if (startDateInput.value && endDateInput.value) {
            fetchDashboardData("custom", startDateInput.value, endDateInput.value);
        }
    });

    // Fetch initial data
    fetchDashboardData();
    loadFinancialData();

});
