document.addEventListener("DOMContentLoaded", async () => {
    const calendarEl = document.getElementById("fullcalendar");
    const eventsContainer = document.getElementById("events-container");
    const allEventsTable = document.getElementById("all-events");
    const searchInput = document.getElementById("searchInput");
    const selectedDateEl = document.getElementById('selected-date');
    const dailyEventsEl = document.getElementById('daily-events');
    const dailyPaginationEl = document.getElementById('daily-pagination');
    const allPaginationEl = document.getElementById('all-pagination');

    if (!calendarEl) {
        console.error("Calendar element not found");
        return;
    }

    let events = await fetchEventReservations();
    let dailyPage = 1;
    let allPage = 1;
    const dailyPerPage = 5;
    const allPerPage = 10;

    async function fetchEventReservations() {
        try {
            const response = await fetch('http://192.168.100.31:8002/api/event-reservation/');
            if (!response.ok) throw new Error("Failed to fetch event reservations.");
            const data = await response.json();
            console.log("Fetched Reservations:", data); // ✅ Debugging to check fetched data
            return data;
        } catch (error) {
            console.error("Error fetching event reservations:", error);
            return [];
        }
    }

    // ✅ Convert API data into FullCalendar events
    function mapEventsForCalendar(eventList) {
        return eventList.map(event => ({
            title: `${event.customer?.first_name || 'Unknown'} ${event.customer?.last_name || ''} (${event.reservation_time || 'N/A'})`,
            start: event.reservation_date ? `${event.reservation_date}T${event.reservation_time || '00:00'}` : null,
            extendedProps: {
                id: event.id,
                customer: `${event.customer?.first_name || ''} ${event.customer?.last_name || ''}`,
                time: event.reservation_time || 'N/A',
                venue: event.venue?.venue_name || 'N/A'
            }
        })).filter(event => event.start !== null);
    }
    

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "Incoming": return "warning";
            case "Ongoing": return "info";
            case "Completed": return "success";
            case "Cancelled": return "danger";
            case "Overdue": return "primary";
            default: return "secondary";
        }
    };

    function getStatusButtons(res) {
        let buttons = `
            <button class="btn btn-sm btn-info" onclick="openModal(${res.id}, '${res.type}')">
                <i class="bi bi-eye"></i>
            </button>`;
        if (res.status === "Incoming" || res.status === "Overdue") {
            buttons += `
                <button class="btn btn-sm btn-info" onclick="updateStatus(${res.id}, 'Ongoing', '${res.type}')">
                    <i class="bi bi-arrow-right-circle"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="updateStatus(${res.id}, 'Cancelled', '${res.type}')">
                    <i class="bi bi-x-circle"></i>
                </button>`;
        } else if (res.status === "Ongoing") {
            buttons += `
                <button class="btn btn-sm btn-warning" onclick="updateStatus(${res.id}, 'Incoming', '${res.type}')">
                    <i class="bi bi-arrow-left-circle"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateStatus(${res.id}, 'Done', '${res.type}')">
                    <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="updateStatus(${res.id}, 'Cancelled', '${res.type}')">
                    <i class="bi bi-x-circle"></i>
                </button>`;
        }
        return buttons;
    }

    const paginateData = (data, page, perPage) => {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    };

    const updatePagination = (total, currentPage, perPage, paginationEl, callback, selectedDate = null) => {
        const totalPages = Math.ceil(total / perPage);
        paginationEl.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", (e) => {
                e.preventDefault();
                if (paginationEl === dailyPaginationEl) {
                    dailyPage = i;
                    callback(selectedDate);
                } else {
                    allPage = i;
                    callback();
                }
            });
            paginationEl.appendChild(li);
        }
    };

    const populateDailyEvents = (date) => {
        const filteredEvents = events.filter(event => event.reservation_date === date);
        
        if (filteredEvents.length === 0) {
            dailyEventsEl.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">No reservations for this day.</td>
                </tr>`;
            return;
        }

        const paginatedData = paginateData(filteredEvents, dailyPage, dailyPerPage);

        dailyEventsEl.innerHTML = paginatedData.map(event => `
            <tr>
                <td>${event.reservation_date || 'N/A'}</td>
                <td>${event.reservation_time || 'N/A'}</td>
                <td>${event.customer?.first_name || 'N/A'} ${event.customer?.last_name || ''}</td>
                <td>${event.customer?.phone_number || 'N/A'}</td>
                <td><span class="badge bg-${getStatusBadgeColor(event.status)}">${event.status || 'Unknown'}</span></td>
                <td>${getStatusButtons(event)}</td>
            </tr>
        `).join("");

        updatePagination(filteredEvents.length, dailyPage, dailyPerPage, dailyPaginationEl, populateDailyEvents, date);
    };

    const renderAllEvents = () => {
        const paginatedData = paginateData(events, allPage, allPerPage);

        allEventsTable.innerHTML = paginatedData.map(event => `
            <tr>
                <td>${event.reservation_date}</td>
                <td>${event.reservation_time}</td>
                <td>${event.customer.first_name} ${event.customer.last_name}</td>
                <td>${event.venue?.venue_name || "N/A"}</td>
                <td><span class="badge bg-${getStatusBadgeColor(event.status)}">${event.status}</span></td>
                <td>${getStatusButtons(event)}</td>
            </tr>
        `).join("");

        updatePagination(events.length, allPage, allPerPage, allPaginationEl, renderAllEvents);
    };


    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: mapEventsForCalendar(events), // Use correctly mapped events
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        dateClick: function (info) {
            selectedDateEl.textContent = info.dateStr;
            populateDailyEvents(info.dateStr);
        }
    });
    
    events = await fetchEventReservations(); 
    calendar.removeAllEvents(); // Clear old events
    calendar.addEventSource(mapEventsForCalendar(events)); // Re-add updated events
    renderAllEvents();
    calendar.render();
    

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredEvents = events.filter(event =>
            event.event_name.toLowerCase().includes(query) ||
            (event.venue?.venue_name.toLowerCase().includes(query) || "")
        );
        events = filteredEvents;
        renderAllEvents();
    });

    document.addEventListener('click', function (event) {
        const viewBtn = event.target.closest('.view-btn');
        const ongoingBtn = event.target.closest('.ongoing-btn');
        const cancelBtn = event.target.closest('.cancel-btn');

        if (viewBtn) {
            const eventId = viewBtn.getAttribute('data-id');
            openModal(eventId);
        }

        if (ongoingBtn) {
            const eventId = ongoingBtn.getAttribute('data-id');
            updateStatus(eventId, 'Ongoing');
        }

        if (cancelBtn) {
            const eventId = cancelBtn.getAttribute('data-id');
            updateStatus(eventId, 'Cancelled');
        }
    });

    window.openModal = async function(id) {
        const apiUrl = `http://192.168.100.31:8002/api/event-reservation/${id}/`;
    
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Failed to fetch reservation details.`);
            const res = await response.json();
    
            console.log('Fetched Event Data:', res); // Debugging to check response
    
            const eventDateTime = res.event_date_time || '';
            const eventTime = eventDateTime.includes('T') ? eventDateTime.split('T')[1].slice(0, 5) : 'N/A';
    
            document.getElementById('modalContent').innerHTML = `
                <form id="editReservationForm">
                    <p><strong>Name:</strong> ${res.customer?.first_name || 'N/A'} ${res.customer?.last_name || ''}</p>
                    <p><strong>Reservation Date:</strong> <input type="date" value="${res.reservation_date || ''}" id="editReservationDate" class="form-control"></p>
                    <p><strong>Event Time:</strong> <input type="time" value="${eventTime}" id="editReservationTime" class="form-control"></p>
                    <p><strong>Venue:</strong> ${res.venue?.venue_name || 'N/A'}</p>
                    <p><strong>Package:</strong> ${res.package?.name || 'N/A'}</p>
                    <p><strong>Number of Guests:</strong> ${res.number_of_guests || 'N/A'}</p>
                    <p><strong>Total Cost:</strong> ₱${res.total_cost || '0.00'}</p>
                    <p><strong>Reference Number:</strong> ${res.reference_number || 'N/A'}</p>
                    <p><strong>Payment Method:</strong> ${res.payment_method || 'N/A'}</p>
                    <p><strong>Special Request:</strong> ${res.special_request || 'None'}</p>
                    <button type="button" class="btn btn-primary mt-3" onclick="window.saveEditedReservation(${res.id})">Save Changes</button>
                </form>
            `;
    
            new bootstrap.Modal(document.getElementById('eventModal')).show();
    
        } catch (error) {
            console.error("Error fetching reservation details:", error);
        }
    };
    
    async function updateStatus(id, newStatus) {
        const payload = { status: newStatus };

        try {
            const response = await fetch(`/api/history/update-reservation-status/${id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error updating status:", errorData);
            } else {
                fetchReservations();
            }
        } catch (error) {
            console.error("Error communicating with the server:", error);
        }
    }
});
