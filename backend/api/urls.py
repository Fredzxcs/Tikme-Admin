from django.urls import path
from .views import (
    
    admin_dashboard,
    dine_in_overview,
    event_overview,
    history,
)


urlpatterns = [
    # Authentication
    path('', admin_dashboard, name='admin_dashboard'),
    path('dine_in_overview/', dine_in_overview, name='dine_in_overview'),
    path('event_overview', event_overview, name='event_overview'),
    path('history', history, name='history'),
]