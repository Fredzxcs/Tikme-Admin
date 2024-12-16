from django.shortcuts import render

def admin_dashboard(request):
    # Your logic for creating a reservation
    return render(request, 'admin_dashboard.html')

def dine_in_overview(request):
    # Your logic for creating a reservation
    return render(request, 'dine_in_overview.html')

def dine_in_booking(request):
    # Your logic for creating a reservation
    return render(request, 'dine_in_booking.html')

def event_overview(request):
    # Your logic for creating a reservation
    return render(request, 'event_overview.html')

def event_booking(request):
    # Your logic for creating a reservation
    return render(request, 'event_booking.html')


