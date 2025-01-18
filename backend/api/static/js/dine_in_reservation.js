// Utility Functions
function formatDate(date) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

function groupReservationsByDate(reservations) {
    const grouped = {};
    reservations.forEach((reservation) => {
        const dateKey = reservation.date;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(reservation);
    });
    return grouped;
}

// State Management
const state = {
    currentDate: new Date(),
    reservations: reservationsData,
    groupedReservations: {},
};

// Render Calendar
function renderCalendar() {
    const calendarDays = document.getElementById("calendar-days");
    const currentMonth = document.getElementById("current-month");

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    currentMonth.textContent = `${state.currentDate.toLocaleString("default", { month: "long" })} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    calendarDays.innerHTML = "";

    // Add empty days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("day", "empty");
        calendarDays.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = day;

        const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        if (state.groupedReservations[dateString]) {
            dayElement.classList.add("has-reservations");
        }

        dayElement.addEventListener("click", () => {
            renderDailyReservations(dateString);
        });

        calendarDays.appendChild(dayElement);
    }
}

// Render Daily Reservations
function renderDailyReservations(dateString) {
    const reservationsList = document.getElementById("reservations-list");
    const selectedDateElement = document.getElementById("selected-date");

    selectedDateElement.textContent = `Reservations for ${formatDate(new Date(dateString))}`;

    const reservations = state.groupedReservations[dateString] || [];

    if (reservations.length === 0) {
        reservationsList.innerHTML = "<p>No reservations for this date.</p>";
        return;
    }

    reservationsList.innerHTML = `
        <table class="daily-reservations-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Ongoing</th>
                </tr>
            </thead>
            <tbody>
                ${reservations
                    .map(
                        (reservation) => `
                    <tr>
                        <td>${reservation.time}</td>
                        <td>${reservation.type}</td>
                        <td>${reservation.customer}</td>
                        <td>${reservation.contact}</td>
                        <td>${reservation.ongoing ? "Yes" : "No"}</td>
                    </tr>
                `
                    )
                    .join("")}
            </tbody>
        </table>
    `;
}

// Render All Reservations
function renderAllReservations() {
    const allReservationsTable = document.querySelector("#all-reservations-table tbody");

    allReservationsTable.innerHTML = state.reservations
        .map(
            (reservation) => `
        <tr>
            <td>${reservation.date}</td>
            <td>${reservation.time}</td>
            <td>${reservation.type}</td>
            <td>${reservation.customer}</td>
            <td>${reservation.contact}</td>
            <td>${reservation.ongoing ? "Yes" : "No"}</td>
        </tr>
    `
        )
        .join("");
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    state.groupedReservations = groupReservationsByDate(state.reservations);

    renderCalendar();
    renderDailyReservations(new Date().toISOString().split("T")[0]);
    renderAllReservations();

    document.getElementById("prev-month").addEventListener("click", () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById("next-month").addEventListener("click", () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderCalendar();
    });
});
