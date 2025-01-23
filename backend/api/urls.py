from django.urls import path
from .views import *



urlpatterns = [
    # Authentication
    path('', views_.admin_dashboard, name='admin_dashboard'),
    path('dine_in_overview/', views_.dine_in_overview, name='dine_in_overview'),
    path('event_overview', views_.event_overview, name='event_overview'),
    path('profile/', views_.view_profile, name='profile'),
    path('settings/', views_.account_settings, name='settings'),
    path('logs/', views_.activity_logs, name='logs'),
     
    path('validate-token/', views_validate_token.ValidateTokenView.as_view(), name='validate_token'),
]
