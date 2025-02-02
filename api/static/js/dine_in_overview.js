document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('fullcalendar');

    if (!calendarEl) {
        console.error("Calendar element not found");
        return;
    }

    // Mock data
    const mockEvents = [
        { title: 'Event 1', start: '2025-01-10' },
        { title: 'Event 2', start: '2025-01-15', end: '2025-01-17' },
        { title: 'Meeting', start: '2025-01-20T10:00:00', end: '2025-01-20T12:00:00' },
    ];

    const mockReservations = [
        { time: '10:00', type: 'Meeting', customer: 'John Doe', contact: '123-456-7890', ongoing: false },
        { time: '14:00', type: 'Lunch', customer: 'Jane Smith', contact: '987-654-3210', ongoing: true },
    ];

    const mockAllReservations = [
        { date: '2025-01-10', type: 'Event', customer: 'Jane Smith', contact: '987-654-3210', ongoing: true },
        { date: '2025-01-15', type: 'Meeting', customer: 'John Doe', contact: '123-456-7890', ongoing: false },
    ];

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [FullCalendar.dayGridPlugin, FullCalendar.timeGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        events: mockEvents,
        dateClick: function (info) {
            document.getElementById('selected-date').textContent = info.dateStr;

            const filteredReservations = mockReservations;

            const dailyReservations = document.getElementById('daily-reservations');
            dailyReservations.innerHTML = filteredReservations
                .map(
                    (res) => `
                    <tr>
                        <td>${res.time}</td>
                        <td>${res.type}</td>
                        <td>${res.customer}</td>
                        <td>${res.contact}</td>
                        <td><input type="checkbox" class="form-check-input" ${res.ongoing ? 'checked' : ''}></td>
                        <td>
                            <button class="btn btn-sm btn-info"><i class="bi bi-eye"></i></button>
                            <button class="btn btn-sm btn-success"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>`
                )
                .join('');
        },
    });

    calendar.render();

    const allReservations = document.getElementById('all-reservations');
    allReservations.innerHTML = mockAllReservations
        .map(
            (res) => `
        <tr>
            <td>${res.date}</td>
            <td>${res.type}</td>
            <td>${res.customer}</td>
            <td>${res.contact}</td>
            <td><input type="checkbox" class="form-check-input" ${res.ongoing ? 'checked' : ''}></td>
            <td>
                <button class="btn btn-sm btn-info"><i class="bi bi-eye"></i></button>
                <button class="btn btn-sm btn-success"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`
        )
        .join('');
});
