# healthapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ---------- Dashboard ----------
    path("dashboard/", views.dashboard, name="dashboard"),

    # ---------- Session management ----------
    path("session/start/", views.start_session, name="start_session"),
    path("session/end/<int:session_id>/", views.end_session, name="end_session"),

    # ---------- Vitals & Radiation ----------
    path("vitals/submit/", views.submit_vitals, name="submit_vitals"),
    path("radiation/submit/", views.submit_radiation, name="submit_radiation"),

    # ---------- Sessions ----------
    path("sessions/mine/", views.my_sessions, name="my_sessions"),
    path("sessions/<int:session_id>/", views.session_detail, name="session_detail"),
    path("sessions/all/", views.admin_all_sessions, name="admin_all_sessions"),

    # ---------- AI Chatbot ----------
    path("chat/", views.ai_chat, name="ai_chat"),
]
