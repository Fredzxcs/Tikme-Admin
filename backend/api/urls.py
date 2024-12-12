from django.urls import path
from .views import (
    
    admin_dashboard,
    dine_in_overview,
    dine_in_booking,
    event_overview,
    event_booking,
)


urlpatterns = [
    # Authentication
    path('', admin_dashboard, name='admin_dashboard'),
    path('dine_in_overview/', dine_in_overview, name='dine_in_overview'),
    path('dine_in_booking/', dine_in_booking, name='dine_in_booking'),
    path('event_overview', event_overview, name='event_overview'),
    path('event_booking/', event_booking, name='event_booking'),
   
    
]