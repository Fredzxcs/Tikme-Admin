document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('fullcalendar');
    const dailyReservationsEl = document.getElementById('daily-reservations');
    const allReservationsEl = document.getElementById('all-reservations');
    const selectedDateEl = document.getElementById('selected-date');
    const dailyPaginationEl = document.getElementById('daily-pagination');
    const allPaginationEl = document.getElementById('all-pagination');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    if (!calendarEl) {
        console.error("Calendar element not found");
        return;
    }

    let reservations = await fetchReservations();
    let dailyPage = 1;
    let allPage = 1;
    const dailyPerPage = 5;
    const allPerPage = 10;

    async function fetchReservations() {
        try {
            const response = await fetch('https://tikme-dine.onrender.com/api/dine-in/');
            if (!response.ok) throw new Error("Failed to fetch reservations.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching reservations:", error);
            return [];
        }
    }

    function paginateData(data, page, perPage) {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    }


    // Function to limit events displayed per day
    function limitEventsPerDay(events, limit = 3) {
        const groupedEvents = {};

        events.forEach(event => {
            const date = event.start.split("T")[0]; // Extract YYYY-MM-DD
            if (!groupedEvents[date]) {
                groupedEvents[date] = [];
            }
            if (groupedEvents[date].length < limit) {
                groupedEvents[date].push(event);
            }
        });

        return Object.values(groupedEvents).flat();
    }

    const eventsData = reservations.map(res => ({
        title: `${res.customer.first_name} ${res.customer.last_name} (${res.reservation_time})`,
        start: `${res.reservation_date}T${res.reservation_time}`,
        extendedProps: { 
            id: res.id,
            customer: res.customer.first_name + " " + res.customer.last_name,
            time: res.reservation_time,
            area: res.preferred_area?.area_name || 'N/A'
        }
    }));

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: limitEventsPerDay(eventsData, 1), // Show max 1 per day
        dateClick: function (info) {
            selectedDateEl.textContent = info.dateStr;
            updateDailyReservations(info.dateStr);
        }
    });

    calendar.render();
    updateDailyReservations(selectedDateEl.textContent);
    updateAllReservations();

    function updateDailyReservations(selectedDate) {
        const filteredData = reservations.filter(res => res.reservation_date === selectedDate);
        
        console.log("Filtered Reservations:", filteredData); // ✅ Debugging: Check if reservations exist for date

        if (filteredData.length === 0) {
            dailyReservationsEl.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">No reservations for this day.</td>
                </tr>`;
            return;
        }

        const paginatedData = paginateData(filteredData, dailyPage, dailyPerPage);

        dailyReservationsEl.innerHTML = paginatedData.map(res => `
            <tr>
                <td>${res.reservation_time}</td>
                <td>${res.preferred_area?.area_name || "N/A"}</td>
                <td>${res.customer.first_name} ${res.customer.last_name}</td>
                <td>${res.customer.phone_number}</td>
                <td><span class="badge bg-${getStatusBadgeColor(res.status)}">${res.status}</span></td>
                <td>${getStatusButtons(res)}</td>
            </tr>
        `).join('');

        updatePagination(filteredData.length, dailyPage, dailyPerPage, dailyPaginationEl, updateDailyReservations, selectedDate);
    }

    function updateAllReservations() {
        const paginatedData = paginateData(reservations, allPage, allPerPage);

        allReservationsEl.innerHTML = paginatedData.map(res => `
            <tr>
                <td>${res.reservation_date}</td>
                <td>${res.preferred_area?.area_name || "N/A"}</td>
                <td>${res.customer.first_name} ${res.customer.last_name}</td>
                <td>${res.customer.phone_number}</td>
                <td><span class="badge bg-${getStatusBadgeColor(res.status)}">${res.status}</span></td>
                <td>
                    ${getStatusButtons(res)}
                </td>
            </tr>
        `).join('');

        updatePagination(reservations.length, allPage, allPerPage, allPaginationEl, updateAllReservations);
    }


    function updatePagination(total, currentPage, perPage, paginationEl, callback, selectedDate = null) {
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
    }

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
    
   
    // Color mapping for status
    function getStatusBadgeColor(status) {
        switch (status) {
            case "Incoming": return "warning";
            case "Ongoing": return "info";
            case "Completed": return "success";
            case "Cancelled": return "danger";
            case "Overdue": return "primary";  // Changed to blue
            default: return "secondary";
        }
    }

    // Event listener for all action buttons
    document.addEventListener('click', function (event) {
        const viewBtn = event.target.closest('.view-btn');
        const ongoingBtn = event.target.closest('.ongoing-btn');
        const cancelBtn = event.target.closest('.cancel-btn');

        if (viewBtn) {
            const reservationId = viewBtn.getAttribute('data-id');
            openModal(reservationId, 'dine-in');
        }

        if (ongoingBtn) {
            const reservationId = ongoingBtn.getAttribute('data-id');
            updateStatus(reservationId, 'Ongoing', 'dine-in');
        }

        if (cancelBtn) {
            const reservationId = cancelBtn.getAttribute('data-id');
            updateStatus(reservationId, 'Cancelled', 'dine-in');
        }
    });

    // Open Modal to View or Edit Dine-In Reservation
    window.openModal = async function(id) {
        const apiUrl = `https://tikme-dine.onrender.com/api/dine-in/${id}/`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Failed to fetch reservation details.`);
            const res = await response.json();

            document.getElementById('modalContent').innerHTML = `
                <form id="editReservationForm">
                    <p><strong>Name:</strong> ${res.customer.first_name} ${res.customer.last_name}</p>
                    <p><strong>Date:</strong> <input type="date" value="${res.reservation_date}" id="editReservationDate" class="form-control"></p>
                    <p><strong>Time:</strong> <input type="time" value="${res.reservation_time}" id="editReservationTime" class="form-control"></p>
                    <p><strong>Location:</strong> ${res.preferred_area?.area_name || 'N/A'}</p>
                    <p><strong>Number of Guests:</strong> ${res.number_of_guests || 'N/A'}</p>
                    <p><strong>Total Bill:</strong> ₱${res.total_bill || '0.00'}</p>
                    <p><strong>Reference Number:</strong> ${res.reference_number || 'N/A'}</p>
                    <p><strong>Payment Method:</strong> ${res.payment_method || 'N/A'}</p>
                    <p><strong>Special Request:</strong> ${res.special_request || 'None'}</p>
                    <button type="button" class="btn btn-primary mt-3" onclick="window.saveEditedReservation(${res.id})">Save Changes</button>
                </form>
            `;

            new bootstrap.Modal(document.getElementById('reservationModal')).show();

        } catch (error) {
            console.error("Error fetching reservation details:", error);
        }
    };


    window.updateStatus = async function(id, newStatus, type) {
        console.log(`Original Status: ${newStatus}`);
        
        // Map frontend status to API-compatible values
        const apiStatusMap = {
            "Incoming": "Confirmed",  // Map Incoming to Confirmed
            "Done": "Completed",      // Ensure Done is mapped to Completed if needed
            "Ongoing": "Ongoing",
            "Overdue": "Overdue",
            "Cancelled": "Cancelled"
        };
    
        const payload = { 
            type: type,
            status: apiStatusMap[newStatus] || newStatus  // Fallback to original if not mapped
        };
    
        console.log("Payload being sent:", JSON.stringify(payload));
    
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
    };
    
    
    

    // Save Edited Reservation Function
    window.saveEditedReservation = async function(id, type) {
        const updatedDate = document.getElementById('editReservationDate').value;
        const updatedTime = document.getElementById('editReservationTime').value;

        const payload = { 
            type: type,
            status: newStatus,
            reservation_date: updatedDate, 
            reservation_time: updatedTime
           
        };

        try {
            const response = await fetch(`/api/history/update-reservation-status/${id}/`, {
                method: "PATCH",  // Changed from PUT to PATCH
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error updating reservation:", errorData);
            } else {
                fetchReservations();
                bootstrap.Modal.getInstance(document.getElementById('reservationModal')).hide();
            }
        } catch (error) {
            console.error("Error communicating with the server:", error);
        }
    };

    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredReservations = reservations.filter(res =>
            res.customer.first_name.toLowerCase().includes(searchTerm) ||
            res.customer.last_name.toLowerCase().includes(searchTerm) ||
            (res.preferred_area?.area_name.toLowerCase().includes(searchTerm) || "")
        );
        reservations = filteredReservations;
        updateAllReservations();
    });

    sortSelect.addEventListener('change', function () {
        const sortBy = sortSelect.value;
        reservations.sort((a, b) => {
            if (sortBy === "date") return new Date(a.reservation_date) - new Date(b.reservation_date);
            if (sortBy === "date-desc") return new Date(b.reservation_date) - new Date(a.reservation_date);
            if (sortBy === "name") return a.customer.first_name.localeCompare(b.customer.first_name);
            if (sortBy === "name-desc") return b.customer.first_name.localeCompare(a.customer.first_name);
            if (sortBy === "area") return (a.preferred_area?.area_name || "").localeCompare(b.preferred_area?.area_name || "");
            if (sortBy === "area-desc") return (b.preferred_area?.area_name || "").localeCompare(a.preferred_area?.area_name || "");
        });
        updateAllReservations();
    });
});
