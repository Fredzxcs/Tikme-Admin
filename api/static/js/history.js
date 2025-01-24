const reservations = [
    {
        id: "1",
        fullName: "Alice Johnson",
        customerImage: "https://placeholder.com/50",
        phoneNumber: "+1 (555) 123-4567",
        email: "alice.johnson@example.com",
        date: "2024-01-15",
        time: "14:00",
        numberOfGuests: 4,
        parkingSlots: 2,
        venueCatalog: "Garden View",
        packageType: "Premium Package",
        paymentMethod: "Credit Card",
        specialRequest: "Gluten-free meal options required",
        location: "Table 12",
        status: "done",
        type: "event",
        dateAdded: "2023-12-20"
    },
    {
        id: "2",
        fullName: "Bob Smith",
        customerImage: "https://placeholder.com/50",
        phoneNumber: "+1 (555) 234-5678",
        email: "bob.smith@example.com",
        date: "2024-01-14",
        time: "19:30",
        numberOfGuests: 6,
        parkingSlots: 3,
        venueCatalog: "Grand Hall",
        packageType: "Standard Package",
        paymentMethod: "Bank Transfer",
        location: "Table 7",
        status: "done",
        type: "dine-in",
        dateAdded: "2023-12-18"
    },
    {
        id: "3",
        fullName: "Carol Williams",
        customerImage: "https://placeholder.com/50",
        phoneNumber: "+1 (555) 345-6789",
        email: "carol.williams@example.com",
        date: "2024-01-22",
        time: "18:00",
        numberOfGuests: 8,
        parkingSlots: 4,
        venueCatalog: "Terrace View",
        packageType: "Deluxe Package",
        paymentMethod: "Credit Card",
        specialRequest: "Birthday cake arrangement needed",
        location: "Table 3",
        status: "incoming",
        type: "event",
        dateAdded: "2023-12-22"
    },
    {
        id: "4",
        fullName: "David Brown",
        customerImage: "https://placeholder.com/50",
        phoneNumber: "+1 (555) 456-7890",
        email: "david.brown@example.com",
        date: "2024-01-23",
        time: "20:00",
        numberOfGuests: 2,
        parkingSlots: 1,
        venueCatalog: "Intimate Corner",
        packageType: "Romantic Package",
        paymentMethod: "Digital Wallet",
        location: "Table 9",
        status: "incoming",
        type: "dine-in",
        dateAdded: "2023-12-21"
    },
    {
        id: "5",
        fullName: "Eve Davis",
        customerImage: "https://placeholder.com/50",
        phoneNumber: "+1 (555) 567-8901",
        email: "eve.davis@example.com",
        date: "2024-01-16",
        time: "17:30",
        numberOfGuests: 5,
        parkingSlots: 2,
        venueCatalog: "Garden View",
        packageType: "Standard Package",
        paymentMethod: "Credit Card",
        location: "Table 5",
        status: "cancelled",
        type: "event",
        dateAdded: "2023-12-19"
    },
    {
        id: "6",
        fullName: "Frank Miller",
        customerImage: "https://placeholder.com/50",
        phoneNumber: "+1 (555) 678-9012",
        email: "frank.miller@example.com",
        date: "2024-01-17",
        time: "19:00",
        numberOfGuests: 3,
        parkingSlots: 1,
        venueCatalog: "Cozy Corner",
        packageType: "Basic Package",
        paymentMethod: "Bank Transfer",
        specialRequest: "Wheelchair accessibility needed",
        location: "Table 2",
        status: "cancelled",
        type: "dine-in",
        dateAdded: "2023-12-23"
    }
];

let currentType = 'all';
let currentStatus = 'all';
let searchQuery = '';

function renderReservations() {
    const reservationList = document.getElementById('reservationList');
    reservationList.innerHTML = '';

    const filteredReservations = reservations.filter(reservation => 
        (currentType === 'all' || reservation.type === currentType) &&
        (currentStatus === 'all' || reservation.status === currentStatus) &&
        (reservation.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         reservation.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filteredReservations.forEach(reservation => {
        const reservationItem = document.createElement('div');
        reservationItem.className = 'reservation-item';
        reservationItem.innerHTML = `
            <div class="avatar">${reservation.fullName.charAt(0)}</div>
            <div class="reservation-details">
                <div class="reservation-name">${reservation.fullName}</div>
                <div class="reservation-info">
                    ${reservation.date} | ${reservation.time} | ${reservation.location} | ${reservation.type}
                </div>
                <div class="date-added">Added on: ${reservation.dateAdded}</div>
            </div>
            <span class="status-badge status-${reservation.status}">${reservation.status}</span>
        `;
        reservationItem.addEventListener('click', () => openModal(reservation));
        reservationList.appendChild(reservationItem);
    });
}

function openModal(reservation) {
    const modal = document.getElementById('reservationModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <p><strong>Full Name:</strong> ${reservation.fullName}</p>
        <p><strong>Phone Number:</strong> ${reservation.phoneNumber}</p>
        <p><strong>Email:</strong> ${reservation.email}</p>
        <p><strong>Date:</strong> ${reservation.date}</p>
        <p><strong>Time:</strong> ${reservation.time}</p>
        <p><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
        <p><strong>Parking Slots:</strong> ${reservation.parkingSlots}</p>
        <p><strong>Venue Catalog:</strong> ${reservation.venueCatalog}</p>
        <p><strong>Package Type:</strong> ${reservation.packageType}</p>
        <p><strong>Payment Method:</strong> ${reservation.paymentMethod}</p>
        <p><strong>Location:</strong> ${reservation.location}</p>
        <p><strong>Type:</strong> ${reservation.type}</p>
        <p><strong>Date Added:</strong> ${reservation.dateAdded}</p>
        ${reservation.specialRequest ? `<p><strong>Special Request:</strong> ${reservation.specialRequest}</p>` : ''}
    `;
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('reservationModal');
    modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const typeButtons = document.querySelectorAll('.type-button');
    const statusButtons = document.querySelectorAll('.status-button');
    const searchInput = document.getElementById('searchInput');

    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentType = button.dataset.type;
            renderReservations();
        });
    });

    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatus = button.dataset.status;
            renderReservations();
        });
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderReservations();
    });

    renderReservations();

    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('reservationModal');
        if (event.target === modal) {
            closeModal();
        }
    });
});