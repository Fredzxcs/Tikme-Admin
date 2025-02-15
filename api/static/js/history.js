document.addEventListener("DOMContentLoaded", async function () {
    const reservationList = document.getElementById("reservationList");
    const searchInput = document.getElementById("searchInput");
    const paginationContainer = document.getElementById("pagination");
    const typeButtons = document.querySelectorAll(".filter-type");
    const statusButtons = document.querySelectorAll(".filter-status");
    const todayButton = document.getElementById("todayButton");
    const thisWeekButton = document.getElementById("thisWeekButton");
    const thisMonthButton = document.getElementById("thisMonthButton");

    let reservations = [];
    let currentType = "all";
    let currentStatus = "all";
    let currentPage = 1;
    let perPage = 10;
    let currentDateFilter = "all";

    async function fetchDineInReservations() {
        try {
            const response = await fetch("https://tikme-dine.onrender.com/api/dine-in/");
            if (!response.ok) throw new Error("Failed to fetch dine-in reservations.");
            const dineInData = await response.json();
            return dineInData.map(res => ({
                ...res,
                type: "dine-in",
                status: getStatusWithOverdueCheck({ ...res, type: "dine-in" }),
                location: res.preferred_area?.area_name || "N/A"
            }));
        } catch (error) {
            console.error("Error fetching dine-in reservations:", error);
            return [];
        }
    }

    async function fetchEventReservations() {
        try {
            const response = await fetch("https://tikme-dine.onrender.com/api/event-reservation/");
            if (!response.ok) throw new Error("Failed to fetch event reservations.");
            const eventData = await response.json();
            return eventData.map(res => ({
                ...res,
                type: "event",
                status: getStatusWithOverdueCheck({ ...res, type: "event" }),
                location: res.venue?.venue_name || "N/A"
            }));
        } catch (error) {
            console.error("Error fetching event reservations:", error);
            return [];
        }
    }

    function getStatusWithOverdueCheck(reservation) {
        const now = new Date(); // Current date-time
    
        // ✅ Ensure correct date parsing
        const reservationDate = reservation.reservation_date;  // "2025-02-05"
        const reservationTime = reservation.reservation_time;  // "09:30:00"
    
        // ✅ Correct format: "YYYY-MM-DDTHH:MM:SS"
        const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
    
        console.log("Parsed Reservation Date:", reservationDateTime);
        console.log("Current Date:", now);
    
        // ✅ Ensure it's read properly
        if (isNaN(reservationDateTime.getTime())) {
            console.error("Invalid reservation date/time format:", reservationDate, reservationTime);
            return reservation.status; // Return existing status if parsing fails
        }
    
        reservationDateTime.setMinutes(reservationDateTime.getMinutes() + 15); // Grace period
    
        // If the reservation is in the future, mark it as "Incoming"
        if (reservation.status === "Confirmed" && now < reservationDateTime) {
            return "Incoming";
        }
    
        if (reservation.status === "Confirmed" && now > reservationDateTime && reservation.status !== "Overdue") {
            markReservationAsOverdue(reservation.id, reservation.type);
            return "Overdue";
        }
    
        if (reservation.status === "Overdue") {
            const overdueTime = new Date(reservationDateTime);
            overdueTime.setMinutes(overdueTime.getMinutes() + 30);
            if (now > overdueTime) {
                autoCancelReservation(reservation.id, reservation.type);
                return "Cancelled";
            }
        }
    
        return reservation.status;
    }
    
    
    
    async function autoCancelReservation(id, type) {
        console.log(`Auto-canceling reservation ID: ${id}, Type: ${type}`);
        await updateStatus(id, "Cancelled", type);
    }
    
    
    async function markReservationAsOverdue(id, type) {
        await updateStatus(id, "Overdue", type);
    }

    async function fetchReservations() {
        const dineIn = await fetchDineInReservations();
        const event = await fetchEventReservations();
        reservations = [...dineIn, ...event];
        renderReservations();
    }
    

    function renderReservations() {
        const filteredData = reservations
            .filter(filterByTypeAndStatus)
            .filter(filterByDate)
            .filter(filterBySearch);
        const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
        reservationList.innerHTML = paginatedData
            .map(res => `
            <tr>
                <td>${res.customer.first_name} ${res.customer.last_name}</td>
                <td>${res.reservation_date}</td>
                <td>${res.reservation_time}</td>
                <td>${res.location}</td>
                <td>${res.type}</td>
                <td class="status-cell">${getStatusBadge(res)}</td>
                <td>
                    ${getStatusButtons(res)}
                </td>
            </tr>
        `)
            .join("");
        renderPagination(filteredData.length);
    }

    
    function renderPagination(totalItems) {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalItems / perPage);
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.innerHTML += `<li class="page-item ${i === currentPage ? "active" : ""}">
                <button class="page-link" onclick="window.changePage(${i})">${i}</button>
            </li>`;
        }
    }

    window.changePage = function (page) {
        currentPage = page;
        renderReservations();
    };

    function getStatusBadge(res) {
        let color = res.status === "Incoming" ? "warning" :
            res.status === "Ongoing" ? "info" :
            res.status === "Completed" ? "success" :
            res.status === "Overdue" ? "dark" :
            res.status === "Cancelled" ? "danger" :
            "dark";
        let displayStatus = res.status === "Completed" ? "Done" : res.status;
        return `<span class="badge bg-${color}">${displayStatus}</span>`;
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

    window.updateStatus = async function (id, newStatus, type) {
        const apiStatusMap = {
            "Incoming": "Confirmed",
            "Ongoing": "Ongoing",
            "Done": "Completed",
            "Overdue": "Overdue",
            "Cancelled": "Cancelled"
        };
    
        const mappedStatus = apiStatusMap[newStatus] || newStatus;
    
        // 🔥 Step 1: Show SweetAlert confirmation before proceeding
        const confirmation = await Swal.fire({
            title: `Change status to ${newStatus}?`,
            text: `Are you sure you want to update this reservation to ${newStatus}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        });
    
        // If user cancels, do nothing
        if (!confirmation.isConfirmed) return;
    
        // 🔥 Step 2: Show a loading alert while processing
        Swal.fire({
            title: "Updating...",
            text: "Please wait while we update the reservation.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    
        const payload = {
            type: type,
            status: mappedStatus,
        };
    
        console.log("Sending Payload:", JSON.stringify(payload)); // ✅ Debugging output
    
        try {
            const response = await fetch(`https://capstone-reservation.onrender.com/api/history/update-reservation-status/${id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error updating reservation:", errorText);
                Swal.fire("Update Failed", "An error occurred while updating the reservation.", "error");
            } else {
                console.log("Reservation updated successfully.");
    
                // ✅ If reservation is now "Completed", send payment details
                if (mappedStatus === "Completed") {
                    await sendPaymentDetails(id, type);
                }
    
                // 🔥 Step 3: Show a success message
                Swal.fire({
                    title: "Success!",
                    text: `The reservation has been updated to ${newStatus}.`,
                    icon: "success",
                    confirmButtonText: "OK"
                });
    
                fetchReservations(); // Refresh list
            }
        } catch (error) {
            console.error("Error communicating with the server:", error);
            Swal.fire("Server Error", "Failed to communicate with the server.", "error");
        }
    };
    
    
    async function sendPaymentDetails(id, type) {
        const apiUrl = type === "dine-in"
            ? `https://capstone-reservation.onrender.com/api/dine-in/${id}/`
            : `https://capstone-reservation.onrender.com/api/event-reservation/${id}/`;
    
        try {
            // ✅ Fetch reservation details
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch reservation details.");
            const reservation = await response.json();
    
            // ✅ Extract PayMongo session details
            const session_data = reservation.paymongo_session || {}; // Ensure PayMongo data exists
            const attributes = session_data.data?.attributes || {};  // Extract attributes safely
    
            // ✅ Ensure transaction_id is retrieved
            const transaction_id = session_data.data?.id || reservation.reference_number || `TRANS-${Date.now()}`;
    
            // ✅ Structure payment payload like PayMongo format
            const finance_payload = {
                "transaction_id": transaction_id, 
                "PaymentDate": reservation.reservation_date || new Date().toISOString().split("T")[0], // Default to today
                "Amount": reservation.total_bill || reservation.total_cost || 0,  // Ensure amount is present
                "PaymentMethod": attributes.payment_method_types
                    ? attributes.payment_method_types.join(", ")
                    : reservation.payment_method || "Cash", // Fallback if missing
                "Description":  
                    (type === "dine-in"
                        ? `Services rendered for Dine-In Reservation - ${reservation.customer.first_name} ${reservation.customer.last_name}`
                        : `Services rendered for Event Reservation - ${reservation.customer.first_name} ${reservation.customer.last_name}`)

            };
    
            console.log("🚀 Sending Payment Payload:", JSON.stringify(finance_payload)); // ✅ Debugging output
    
            // ✅ Send the payment data to Finance API
            const paymentResponse = await fetch("https://capstone-financemanagement.onrender.com/payment-record/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finance_payload)
            });
    
            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                console.error("❌ Error sending payment data:", errorData);
            } else {
                console.log("✅ Payment details successfully sent.");
            }
        } catch (error) {
            console.error("❌ Error fetching reservation or sending payment details:", error);
        }
    }
    
    
    window.openModal = async function (id, type) {
        const apiUrl = type === "dine-in"
            ? `https://capstone-reservation.onrender.com/api/dine-in/${id}/`
            : `https://capstone-reservation.onrender.com/api/event-reservation/${id}/`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch reservation details.");
            const res = await response.json();
            document.getElementById("modalContent").innerHTML = `
                <form id="editReservationForm">
                    <p><strong>Name:</strong> ${res.customer.first_name} ${res.customer.last_name}</p>
                    <p><strong>Date:</strong> <input type="date" value="${res.reservation_date}" id="editReservationDate" class="form-control"></p>
                    <p><strong>Time:</strong> <input type="time" value="${res.reservation_time}" id="editReservationTime" class="form-control"></p>
                    <p><strong>Location:</strong> ${res.preferred_area?.area_name || res.venue?.venue_name || "N/A"}</p>
                    <p><strong>Number of Guests:</strong> ${res.number_of_guests || "N/A"}</p>
                    <p><strong>Total Bill:</strong>${res.total_bill || res.total_cost || "0.00"}</p>
                    <p><strong>Reference Number:</strong> ${res.reference_number || "N/A"}</p>
                    <p><strong>Payment Method:</strong> ${res.payment_method || "N/A"}</p>
                    <p><strong>Special Request:</strong> ${res.special_request || "None"}</p>
                    <button type="button" class="btn btn-primary mt-3" onclick="window.saveEditedReservation(${res.id}, '${type}')">Save Changes</button>
                </form>`;
            new bootstrap.Modal(document.getElementById("reservationModal")).show();
        } catch (error) {
            console.error("Error fetching reservation details:", error);
        }
    };

    window.saveEditedReservation = async function (id, type) {
        const updatedDate = document.getElementById("editReservationDate").value;
        const updatedTime = document.getElementById("editReservationTime").value;
    
        const now = new Date();
        const selectedDateTime = new Date(`${updatedDate}T${updatedTime}`);
    
        // Prevent selecting past dates/times
        if (selectedDateTime < now) {
            console.error("Error: Cannot select past date or time!");
            Swal.fire("Invalid Date", "You cannot select a past date or time.", "error");
            return;
        }
    
        // Automatically set status to "Incoming" after editing date/time
        const mappedStatus = "Confirmed"; // "Confirmed" means "Incoming"
    
        const payload = {
            type: type,
            status: mappedStatus, // Ensure status is set to "Incoming"
            reservation_date: updatedDate,
            reservation_time: updatedTime
        };
    
        console.log("Sending Payload:", JSON.stringify(payload)); // ✅ Debugging output
    
        try {
            const response = await fetch(`https://capstone-reservation.onrender.com/api/history/update-reservation-status/${id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                const errorText = await response.text(); // Capture raw response text
                console.error("Error updating reservation:", errorText);
                Swal.fire("Update Failed", "An error occurred while updating the reservation.", "error");
            } else {
                const result = await response.json();
                console.log("Reservation updated successfully:", result);
                Swal.fire("Success", "Reservation updated to Incoming.", "success");
                fetchReservations();
                bootstrap.Modal.getInstance(document.getElementById("reservationModal")).hide();
            }
        } catch (error) {
            console.error("Error communicating with the server:", error);
            Swal.fire("Server Error", "Failed to communicate with the server.", "error");
        }
    };
    
    


    function filterByTypeAndStatus(res) {
        const displayStatus = res.status === "Completed" ? "Done" : res.status;
        return (currentType === "all" || res.type === currentType) &&
            (currentStatus === "all" || currentStatus === displayStatus);
    }

    function filterByDate(res) {
        const today = new Date();
        const reservationDate = new Date(res.reservation_date);
        if (currentDateFilter === "today") {
            return reservationDate.toDateString() === today.toDateString();
        } else if (currentDateFilter === "thisWeek") {
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            return reservationDate >= startOfWeek && reservationDate <= endOfWeek;
        } else if (currentDateFilter === "thisMonth") {
            return (reservationDate.getMonth() === today.getMonth() && reservationDate.getFullYear() === today.getFullYear());
        }
        return true;
    }

    function filterBySearch(res) {
        return res.customer.first_name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            res.customer.last_name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            res.location.toLowerCase().includes(searchInput.value.toLowerCase());
    }

    // Event listeners for type and status filter buttons
    typeButtons.forEach(button => {
        button.addEventListener("click", () => {
            typeButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentType = button.dataset.type;
            renderReservations();
        });
    });

    statusButtons.forEach(button => {
        button.addEventListener("click", () => {
            statusButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentStatus = button.dataset.status;
            renderReservations();
        });
    });

    searchInput.addEventListener("input", () => {
        renderReservations();
    });

    if (todayButton) {
        todayButton.addEventListener("click", () => {
            currentDateFilter = "today";
            renderReservations();
        });
    }
    if (thisWeekButton) {
        thisWeekButton.addEventListener("click", () => {
            currentDateFilter = "thisWeek";
            renderReservations();
        });
    }
    if (thisMonthButton) {
        thisMonthButton.addEventListener("click", () => {
            currentDateFilter = "thisMonth";
            renderReservations();
        });
    }

    fetchReservations();
});
