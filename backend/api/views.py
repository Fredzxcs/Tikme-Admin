from django.shortcuts import render, redirect
# from django.contrib import messages
# from authentication.utils import jwt_authenticate  # Import from utils.py
# from authentication.models import Employee


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

