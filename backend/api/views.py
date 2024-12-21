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

def view_profile(request):
    # Logic to fetch and display profile info
    return render(request, 'profile.html')

def account_settings(request):
    # Logic to handle settings updates
    return render(request, 'settings.html')

def activity_logs(request):
    # Logic to fetch and display activity logs
    return render(request, 'logs.html')

