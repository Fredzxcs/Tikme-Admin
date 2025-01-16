from django.urls import path
from .views import (
    
    admin_dashboard,
    dine_in_overview,
    dine_in_booking,
    event_overview,
    event_booking,
    view_profile,
    account_settings,
    activity_logs,
)


urlpatterns = [
    # Authentication
    path('', admin_dashboard, name='admin_dashboard'),
    path('dine_in_overview/', dine_in_overview, name='dine_in_overview'),
    path('event_overview', event_overview, name='event_overview'),
    path('profile/', view_profile, name='profile'),
    path('settings/', account_settings, name='settings'),
    path('logs/', activity_logs, name='logs'),
   
    
]