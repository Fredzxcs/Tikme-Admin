document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bookingForm');
    const calendar = document.getElementById('calendar');
    const selectedDateInput = document.getElementById('selectedDate');

    function generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];

        let calendarHTML = `
            <div class="calendar-header">
                <button id="prevMonth">&lt;</button>
                <span>${monthNames[month]} ${year}</span>
                <button id="nextMonth">&gt;</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-cell header">Su</div>
                <div class="calendar-cell header">Mo</div>
                <div class="calendar-cell header">Tu</div>
                <div class="calendar-cell header">We</div>
                <div class="calendar-cell header">Th</div>
                <div class="calendar-cell header">Fr</div>
                <div class="calendar-cell header">Sa</div>
        `;

        // Get the first day of the month
        const startingDay = firstDay.getDay();
        
        // Get the last day of previous month
        const prevLastDay = new Date(year, month, 0).getDate();
        
        // Add previous month's days
        for (let i = startingDay - 1; i >= 0; i--) {
            calendarHTML += `
                <div class="calendar-cell disabled">${prevLastDay - i}</div>
            `;
        }

        // Add current month's days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const isDisabled = date < today;
            const isSelected = selectedDateInput.value === date.toISOString().split('T')[0];
            
            calendarHTML += `
                <div class="calendar-cell${isDisabled ? ' disabled' : ''}${isSelected ? ' selected' : ''}" 
                     data-date="${date.toISOString().split('T')[0]}">
                    ${day}
                </div>
            `;
        }

        // Add next month's days
        const totalCells = 42;
        const remainingCells = totalCells - (startingDay + lastDay.getDate());
        for (let day = 1; day <= remainingCells; day++) {
            calendarHTML += `
                <div class="calendar-cell disabled">${day}</div>
            `;
        }

        calendarHTML += '</div>';
        calendar.innerHTML = calendarHTML;

        // Add event listeners
        document.getElementById('prevMonth').addEventListener('click', (e) => {
            e.preventDefault();
            generateCalendar(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
        });

        document.getElementById('nextMonth').addEventListener('click', (e) => {
            e.preventDefault();
            generateCalendar(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1);
        });

        // Add click events for date selection
        calendar.querySelectorAll('.calendar-cell:not(.disabled):not(.header)').forEach(cell => {
            cell.addEventListener('click', () => {
                calendar.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                selectedDateInput.value = cell.dataset.date;
            });
        });
    }

    // Generate initial calendar
    const currentDate = new Date();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

    // Form validation
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (validateForm()) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            console.log('Form data:', data);
            alert('Booking submitted successfully!');
            form.reset();
            calendar.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('selected'));
            selectedDateInput.value = '';
        }
    });

    function validateForm() {
        let isValid = true;

        // Clear all existing errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                showError(field, 'This field is required');
            }
        });

        // Validate email format
        const emailField = form.querySelector('#email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            isValid = false;
            showError(emailField, 'Please enter a valid email address');
        }

        // Validate phone number format
        const phoneField = form.querySelector('#phone');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            isValid = false;
            showError(phoneField, 'Please enter a valid phone number format: (000) 000-0000');
        }

        // Validate date selection
        if (!selectedDateInput.value) {
            isValid = false;
            showError(calendar, 'Please select a date');
        }

        return isValid;
    }

    function showError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^$$\d{3}$$ \d{3}-\d{4}$/.test(phone);
    }
});

