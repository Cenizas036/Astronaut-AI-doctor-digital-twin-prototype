# healthapp/views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import login as auth_login
from django.contrib.auth.views import LoginView
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.urls import reverse
import json

from .models import Session, VitalLog, RadiationLog, ChatHistory, AlertLog
from .ai_chatbot import get_chatbot_response
from .forms import CustomUserCreationForm

User = get_user_model()


# ---------- Custom Login View ----------
class CustomLoginView(LoginView):
    """
    Custom login view that redirects based on role:
      - Admin → admin-dashboard
      - Astronaut → astronaut-dashboard
    """
    template_name = "login.html"

    def get_success_url(self):
        user = self.request.user
        if getattr(user, "role", None) == "admin" or user.is_superuser:
            return "/admin-dashboard/"
        return "/astronaut-dashboard/"


# ---------- Public pages ----------
def index(request):
    """ Project-level index page (templates/index.html) """
    return render(request, "index.html")


def register(request):
    """
    Register new user.
    - saves gender and role from the custom form,
    - logs the user in,
    - shows a success popup message,
    - redirects to the appropriate dashboard.
    """
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            gender = form.cleaned_data.get("gender")
            role = form.cleaned_data.get("role")
            if gender:
                setattr(user, "gender", gender)
            if role:
                setattr(user, "role", role)
            user.save()

            auth_login(request, user)
            messages.success(request, "Account created successfully. Redirecting...")

            if getattr(user, "role", None) == "admin" or user.is_superuser:
                return redirect("admin-dashboard")
            return redirect("astronaut-dashboard")
        else:
            return render(request, "register.html", {"form": form})
    else:
        form = CustomUserCreationForm()
        return render(request, "register.html", {"form": form})


# ---------- Dashboard routing ----------
@login_required
def dashboard(request):
    """ Route user to correct dashboard after login """
    if getattr(request.user, "role", None) == "admin" or request.user.is_superuser:
        return redirect("admin-dashboard")
    return redirect("astronaut-dashboard")


@login_required
def astronaut_dashboard(request):
    """ Astronaut dashboard template """
    return render(request, "astronaut-dashboard.html")


@user_passes_test(lambda u: u.is_superuser or getattr(u, "role", None) == "admin")
def admin_dashboard(request):
    """ Admin dashboard template """
    return render(request, "admin-dashboard.html")


# ---------- Session & Data endpoints ----------
@login_required
def start_session(request):
    """ Start a new session for the logged-in user """
    session = Session.objects.create(user=request.user, started_at=now())
    try:
        redirect_url = reverse("session_page", args=[session.id])
    except Exception:
        redirect_url = f"/session/{session.id}/"

    return JsonResponse({
        "session_id": session.id,
        "message": "Session started",
        "redirect_url": redirect_url,
    })


@login_required
def end_session(request, session_id):
    try:
        session = Session.objects.get(id=session_id, user=request.user)
        session.ended_at = now()
        session.save()
        return JsonResponse({"message": "Session ended"})
    except Session.DoesNotExist:
        return JsonResponse({"error": "Session not found"}, status=404)


@csrf_exempt
@login_required
def submit_vitals(request):
    """ Submit astronaut vitals and trigger alerts if abnormal """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    session_id = data.get("session_id")
    if not session_id:
        return JsonResponse({"error": "No session_id provided"}, status=400)

    try:
        session = Session.objects.get(id=session_id, user=request.user)
    except Session.DoesNotExist:
        return JsonResponse({"error": "Session not found"}, status=404)

    vitals = VitalLog.objects.create(
        session=session,
        heart_rate=data.get("heart_rate", 0),
        oxygen_saturation=data.get("oxygen_saturation", 0),
        blood_pressure=data.get("blood_pressure", 0),
        temperature=data.get("temperature", 0),
        respiration_rate=data.get("respiration_rate"),
        core_temperature=data.get("core_temperature"),
        skin_temperature=data.get("skin_temperature"),
    )

    alerts = []
    if vitals.heart_rate < 40 or vitals.heart_rate > 160:
        alerts.append("Critical heart rate detected!")
    if vitals.oxygen_saturation < 85:
        alerts.append("Oxygen saturation dangerously low!")
    if vitals.temperature > 39 or vitals.temperature < 35:
        alerts.append("Abnormal body temperature detected!")
    if vitals.respiration_rate and (vitals.respiration_rate < 8 or vitals.respiration_rate > 30):
        alerts.append("Respiration rate abnormal!")
    if vitals.core_temperature and (vitals.core_temperature > 40 or vitals.core_temperature < 34):
        alerts.append("Core temperature critical!")
    if vitals.skin_temperature and (vitals.skin_temperature < 25 or vitals.skin_temperature > 40):
        alerts.append("Skin temperature abnormal!")

    for msg in alerts:
        AlertLog.objects.create(session=session, alert_type="Vitals", message=msg, severity="critical")

    return JsonResponse({"message": "Vitals submitted", "id": vitals.id, "alerts": alerts})


@csrf_exempt
@login_required
def submit_radiation(request):
    """ Submit radiation data and trigger alerts """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    session_id = data.get("session_id")
    if not session_id:
        return JsonResponse({"error": "No session_id provided"}, status=400)

    try:
        session = Session.objects.get(id=session_id, user=request.user)
    except Session.DoesNotExist:
        return JsonResponse({"error": "Session not found"}, status=404)

    radiation = RadiationLog.objects.create(
        session=session,
        dose_rate=data.get("dose_rate", 0),
        cumulative_dose=data.get("cumulative_dose", 0),
        exposure_duration=data.get("exposure_duration", 0),
        event_type=data.get("event_type", "unknown"),
        alert_level=data.get("alert_level", "green"),
    )

    alerts = []
    if radiation.alert_level.lower() == "red":
        alerts.append("Severe radiation detected! Immediate shelter required.")
    elif radiation.alert_level.lower() == "yellow":
        alerts.append("Radiation warning. Elevated exposure risk.")

    for msg in alerts:
        AlertLog.objects.create(session=session, alert_type="Radiation", message=msg, severity="critical")

    return JsonResponse({"message": "Radiation data submitted", "id": radiation.id, "alerts": alerts})


@login_required
def my_sessions(request):
    sessions = Session.objects.filter(user=request.user).values("id", "started_at", "ended_at")
    return JsonResponse({"sessions": list(sessions)})


@login_required
def session_detail(request, session_id):
    """ Return session details (vitals, radiation, chats, alerts) as JSON """
    try:
        session = Session.objects.get(id=session_id, user=request.user)
    except Session.DoesNotExist:
        return JsonResponse({"error": "Session not found"}, status=404)

    vitals = list(VitalLog.objects.filter(session=session).values())
    radiation = list(RadiationLog.objects.filter(session=session).values())
    chats = list(ChatHistory.objects.filter(session=session).values())
    alerts = list(AlertLog.objects.filter(session=session).values())

    return JsonResponse({
        "session": {"id": session.id, "started_at": session.started_at, "ended_at": session.ended_at},
        "vitals": vitals,
        "radiation": radiation,
        "chats": chats,
        "alerts": alerts,
    })


@user_passes_test(lambda u: u.is_superuser or getattr(u, "role", None) == "admin")
def admin_all_sessions(request):
    """ Admin-only API to list all sessions """
    sessions = Session.objects.all().values("id", "user__username", "started_at", "ended_at")
    return JsonResponse({"sessions": list(sessions)})


# ---------- AI Chatbot API ----------
@csrf_exempt
def ai_chat(request):
    """ Chat API endpoint """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    session_id = data.get("session_id")
    message = data.get("message", "")

    if not session_id:
        return JsonResponse({"error": "No session_id provided"}, status=400)

    bot_reply = get_chatbot_response(session_id, message)
    response_text = bot_reply.get("response", bot_reply) if isinstance(bot_reply, dict) else str(bot_reply)

    try:
        ChatHistory.objects.create(session_id=session_id, user_message=message, bot_response=response_text)
    except Exception:
        pass

    return JsonResponse({"response": response_text})
