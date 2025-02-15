from django.urls import path
from .views import *


urlpatterns = [
    #render templates
    path('', views_.admin_dashboard_view, name='admin-dashboard'),
    path('dine_in_overview/', views_.dine_in_overview_view, name='dine-in-overview'),
    path('event_overview/', views_.event_overview_view, name='event-overview'),
    path('history/', views_.history_view, name='history'),
    path('survey_overview/', views_.survey_overview_view, name='survey-overview'),
    path('guest_overview/', views_.guest_overview_view, name='guest-overview'),

    #api
    path('api/history/update-reservation-status/<int:pk>/', views_history.HistoryUpdateReservationStatusView.as_view(), name='update-reservation-status'),
    
]
