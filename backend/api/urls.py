from django.urls import path
from .views import *


urlpatterns = [
    # Authentication
    path('', views_.admin_dashboard, name='admin-dashboard'),
    path('dine-in-overview/', views_.dine_in_overview, name='dine-in-overview'),
    path('event-overview', views_.event_overview, name='event-overview'),
    # path('profile/', views_.view_profile, name='profile'),
    # path('settings/', views_.account_settings, name='settings'),
    # path('logs/', views_.activity_logs, name='logs'),
   
    
]