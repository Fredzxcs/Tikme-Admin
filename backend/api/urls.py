from django.urls import path
from .views import (
    
    admin_dashboard,
    dine_in_reservation,
    event_reservation,
)


urlpatterns = [
    # Authentication
    path('', admin_dashboard, name='admin_dashboard'),
    path('dine_in_reservation/', dine_in_reservation, name='dine_in_reservation'),
    path('event_reservation/', event_reservation, name='event_reservation'),
    
    
]