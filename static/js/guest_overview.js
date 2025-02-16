document.addEventListener("DOMContentLoaded", async () => {
    const guestListEl = document.getElementById("guest-list");
    const searchInput = document.getElementById("searchInput");
    const paginationEl = document.getElementById("pagination");

    let guests = [];
    let filteredGuests = []; // ✅ Keep a separate filtered guest list
    let currentPage = 1;
    const perPage = 10;

    // Fetch Customers Data from the API
    async function fetchGuests() {
        try {
            const response = await fetch("https://tikme-dine.onrender.com/api/customers/");
            if (!response.ok) throw new Error("Failed to fetch guest data.");
            guests = await response.json();
            filteredGuests = [...guests]; // ✅ Set filtered guests to full list initially
            renderGuests();
        } catch (error) {
            console.error("Error fetching guest data:", error);
        }
    }

    // Paginate Guests
    function paginateData(data, page, perPage) {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    }

    // Render Guests List
    function renderGuests() {
        const paginatedGuests = paginateData(filteredGuests, currentPage, perPage);

        guestListEl.innerHTML = paginatedGuests.map(guest => `
            <tr>
                <td>${guest.first_name} ${guest.last_name}</td>
                <td>${guest.phone_number || "N/A"}</td>
                <td>${guest.email_address || "N/A"}</td>
            </tr>
        `).join("");

        updatePagination(filteredGuests.length);
    }

    // Update Pagination
    function updatePagination(total) {
        const totalPages = Math.ceil(total / perPage);
        paginationEl.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", (e) => {
                e.preventDefault();
                currentPage = i;
                renderGuests();
            });
            paginationEl.appendChild(li);
        }
    }

    // Search Functionality
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();

        if (query.trim() === "") {
            // ✅ Reset to full guest list when search is cleared
            filteredGuests = [...guests];
        } else {
            // ✅ Filter guests without modifying the original array
            filteredGuests = guests.filter(guest =>
                guest.first_name.toLowerCase().includes(query) ||
                guest.last_name.toLowerCase().includes(query) ||
                guest.email_address.toLowerCase().includes(query)
            );
        }

        currentPage = 1; // ✅ Reset to first page after filtering
        renderGuests();
    });

    // Fetch Guests on Page Load
    fetchGuests();
});
