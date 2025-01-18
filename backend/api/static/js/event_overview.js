// Global State
const state = {
    currentDate: new Date(),
    selectedDate: new Date(),
    reservationsByDate: {},
    currentSortOption: 'date',
    currentSearchTerm: ''
};

// Utility Functions
function formatDateForDisplay(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function groupReservationsByDate(reservations) {
    const grouped = {};
    reservations.forEach(reservation => {
        const dateKey = reservation.fields.date;
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(reservation.fields);
    });
    return grouped;
}

// API Module
class ReservationAPI {
    async fetchReservations() {
        try {
            // Mocking data
            return mockReservations();
        } catch (error) {
            console.error('Error fetching reservations:', error);
            return [];
        }
    }

    async fetchReservationsByDate(date) {
        try {
            const dateStr = this.formatDateForAPI(date);
            const allReservations = mockReservations();
            return allReservations.filter(res => res.fields.date === dateStr);
        } catch (error) {
            console.error('Error fetching reservations by date:', error);
            return [];
        }
    }

    formatDateForAPI(date) {
        return date.toISOString().split('T')[0];
    }
}

// Calendar Module
class Calendar {
    constructor(options) {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.options = options || {};
        this.reservationsByDate = {};

        this.currentMonthElement = document.getElementById('current-month');
        this.prevMonthBtn = document.getElementById('prev-month');
        this.nextMonthBtn = document.getElementById('next-month');
        this.calendarDays = document.getElementById('calendar-days');

        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        this.calendarDays.addEventListener('click', event => {
            if (event.target.classList.contains('day') && !event.target.classList.contains('empty')) {
                const day = parseInt(event.target.textContent, 10);
                const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
                this.selectDate(newDate);
            }
        });

        this.generateCalendar();
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.generateCalendar();
    }

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        this.currentMonthElement.textContent = `${this.currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        this.calendarDays.innerHTML = '';

        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            this.calendarDays.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = day;

            const currentDateString = this.formatDateString(year, month, day);
            if (this.reservationsByDate[currentDateString]) {
                dayElement.classList.add('has-reservations');
            }

            this.calendarDays.appendChild(dayElement);
        }
    }

    formatDateString(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    selectDate(date) {
        this.selectedDate = date;
        this.generateCalendar();
        if (this.options.onDateSelect) {
            this.options.onDateSelect(date);
        }
    }

    updateReservations(reservations) {
        this.reservationsByDate = reservations;
        this.generateCalendar();
    }
}

// Modal Functions
function createViewModal(title, reservation) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Type: ${reservation.type}</p>
                <p>Customer Name: ${reservation.customerName}</p>
                <p>Contact Number: ${reservation.contactNumber}</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    return modal;
}

// Main Reservation System
class ReservationSystem {
    constructor() {
        this.api = new ReservationAPI();
        this.calendar = new Calendar({
            onDateSelect: date => this.handleDateSelect(date)
        });
        this.initialize();
    }

    async initialize() {
        const reservations = await this.api.fetchReservations();
        const groupedReservations = groupReservationsByDate(reservations);
        this.calendar.updateReservations(groupedReservations);
        this.handleDateSelect(new Date());
    }

    async handleDateSelect(date) {
        const reservations = await this.api.fetchReservationsByDate(date);
        this.updateReservationsDisplay(reservations);
    }

    updateReservationsDisplay(reservations) {
        const reservationsList = document.getElementById('reservations-list');
        reservationsList.innerHTML = reservations.map(reservation => `
            <div>
                <p>${reservation.fields.customer_name}</p>
                <p>${reservation.fields.type}</p>
            </div>
        `).join('');
    }
}

// Initialize Reservation System
document.addEventListener('DOMContentLoaded', () => {
    new ReservationSystem();
});

// Mock Data
function mockReservations() {
    return [
        { fields: { date: '2025-01-18', customer_name: 'John Doe', type: 'Dine-In' } },
        { fields: { date: '2025-01-18', customer_name: 'Jane Smith', type: 'Event' } },
    ];
}
