from django.shortcuts import render


def admin_dashboard_view(request):
    # Your logic for creating a reservation
    return render(request, 'admin_dashboard.html')

def dine_in_overview_view(request):
    # Your logic for creating a reservation
    return render(request, 'dine_in_overview.html')


def event_overview_view(request):
    # Your logic for creating a reservation
    return render(request, 'event_overview.html')


def history_view (request):
    # Your logic for creating a reservation
    return render(request, 'history.html')

def guest_overview_view (request):
    # Your logic for creating a reservation
    return render(request, 'guest_overview.html')

def survey_overview_view (request):
    # Your logic for creating a reservation
    return render(request, 'survey_overview.html')