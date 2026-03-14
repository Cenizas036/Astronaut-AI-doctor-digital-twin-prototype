from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_api, name='register_api'),
    path('login/', views.login_api, name='login_api'),
    path('vitals/', views.vitals_api, name='vitals_api'),            # POST/GET
    path('admin-stats/', views.admin_stats, name='admin_stats'),
    path('vitals-overview/', views.vitals_overview, name='vitals_overview'),
    path('recent-alerts/', views.recent_alerts, name='recent_alerts'),
]
