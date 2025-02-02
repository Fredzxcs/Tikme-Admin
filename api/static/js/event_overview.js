document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("fullcalendar");
    const eventsContainer = document.getElementById("events-container");
    const toggleEventsButton = document.getElementById("toggleEvents");

    if (!calendarEl) {
        console.error("Calendar element not found");
        return;
    }

    // Mock Data for Events
    const eventData = [
        {
            id: 1,
            date: "2025-01-10",
            time: "10:00 AM",
            event: "Corporate Meeting",
            venue: "Violeta",
            contact: "123-456-7890",
            ongoing: true,
        },
        {
            id: 2,
            date: "2025-01-15",
            time: "02:00 PM",
            event: "Wedding Reception",
            venue: "African Talisay Trellis",
            contact: "987-654-3210",
            ongoing: false,
        },
        {
            id: 3,
            date: "2025-01-20",
            time: "04:00 PM",
            event: "Conference",
            venue: "Bougainvillea Balcony",
            contact: "555-555-5555",
            ongoing: true,
        },
    ];

    // Populate Daily Events
    const populateDailyEvents = (date) => {
        const dailyEventsTable = document.getElementById("daily-events");
        const filteredEvents = eventData.filter((event) => event.date === date);

        dailyEventsTable.innerHTML = filteredEvents
            .map(
                (event) => `
                <tr>
                    <td>${event.time}</td>
                    <td>${event.event}</td>
                    <td>${event.venue}</td>
                    <td>${event.contact}</td>
                    <td><input type="checkbox" class="form-check-input" ${event.ongoing ? "checked" : ""}></td>
                    <td>
                        <button class="btn btn-sm btn-info"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-success"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`
            )
            .join("");
    };

    // Initialize Calendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: eventData.map((event) => ({
            title: event.event,
            start: event.date,
        })),
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        dateClick: function (info) {
            document.getElementById("selected-date").textContent = info.dateStr;
            populateDailyEvents(info.dateStr);
        },
    });

    // Render Calendar and Populate Today's Events
    calendar.render();
    populateDailyEvents(new Date().toISOString().split("T")[0]);

    // Populate All Events
    const allEventsTable = document.getElementById("all-events");
    const searchInput = document.getElementById("searchInput");

    const renderAllEvents = (events) => {
        allEventsTable.innerHTML = events
            .map(
                (event) => `
                <tr>
                    <td>${event.date}</td>
                    <td>${event.event}</td>
                    <td>${event.venue}</td>
                    <td>${event.contact}</td>
                    <td><input type="checkbox" class="form-check-input" ${event.ongoing ? "checked" : ""}></td>
                    <td>
                        <button class="btn btn-sm btn-info"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-success"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`
            )
            .join("");
    };

    renderAllEvents(eventData);

    // Search Events
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredEvents = eventData.filter((event) =>
            event.venue.toLowerCase().includes(query)
        );
        renderAllEvents(filteredEvents);
    });

    // Toggle Expand/Collapse for Daily Events Section
    toggleEventsButton.addEventListener("click", () => {
        const isExpanded = toggleEventsButton.getAttribute("data-expanded") === "true";

        if (isExpanded) {
            eventsContainer.style.maxHeight = "150px"; // Collapse
            toggleEventsButton.textContent = "Expand";
        } else {
            eventsContainer.style.maxHeight = "none"; // Expand
            toggleEventsButton.textContent = "Collapse";
        }

        toggleEventsButton.setAttribute("data-expanded", !isExpanded);
    });
});
