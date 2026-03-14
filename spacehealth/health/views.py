import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import User, VitalReading, Alert

def simple_alerts_from_vitals(user, vitals):
    alerts_created = []

    hr = vitals["heart_rate"]
    sys_bp = vitals["systolic"]
    dia_bp = vitals["diastolic"]
    oxy = vitals["oxygen_level"]
    temp = vitals["temperature"]
    stress = vitals["stress_level"]

    def save_alert(level, title, message, recommendation=""):
        alert = Alert.objects.create(
            user=user,
            level=level,
            title=title,
            message=message,
            recommendation=recommendation,
        )
        alerts_created.append({
            "id": alert.id,
            "level": alert.level,
            "title": alert.title,
            "message": alert.message,
            "recommendation": alert.recommendation,
            "timestamp": alert.timestamp.isoformat()
        })

    if hr < 50:
        save_alert("critical", "Bradycardia Alert", "Heart rate dangerously low. Immediate attention required.", "Contact mission control.")
    elif hr > 120:
        save_alert("critical", "Tachycardia Alert", "Heart rate critically high.", "Rest and monitor.")
    elif hr < 60 or hr > 100:
        save_alert("warning", "Heart Rate Abnormal", "Heart rate outside normal range.", "Monitor and rest if needed.")

    if sys_bp > 160 or dia_bp > 100:
        save_alert("critical", "Hypertensive Crisis", "Blood pressure critically high.", "Immediate rest and contact medical.")
    elif sys_bp > 140 or dia_bp > 90:
        save_alert("warning", "High Blood Pressure", "Blood pressure elevated.", "Monitor and reduce salt intake.")
    elif sys_bp < 90 or dia_bp < 60:
        save_alert("warning", "Low Blood Pressure", "Blood pressure below normal.", "Hydrate and monitor.")

    if oxy < 90:
        save_alert("critical", "Severe Hypoxemia", "Oxygen saturation critically low.", "Check oxygen systems.")
    elif oxy < 95:
        save_alert("warning", "Low Oxygen Saturation", "Oxygen below optimal range.", "Deep breathing and check equipment.")

    if temp > 101:
        save_alert("critical", "High Fever", "Body temperature dangerously high.", "Cooling protocols.")
    elif temp < 96:
        save_alert("critical", "Hypothermia Risk", "Body temperature dangerously low.", "Warming measures.")
    elif temp > 99.5 or temp < 97:
        save_alert("warning", "Temperature Abnormal", "Body temperature outside normal range.", "Monitor and hydrate.")

    if stress >= 8:
        save_alert("warning", "High Stress Level", "Stress levels significantly elevated.", "Relaxation techniques.")

    risk_factors = []
    if hr > 100: risk_factors.append("elevated heart rate")
    if sys_bp > 130: risk_factors.append("high blood pressure")
    if oxy < 98: risk_factors.append("low oxygen")
    if stress > 6: risk_factors.append("high stress")
    if len(risk_factors) >= 2:
        save_alert("warning", "Multiple Risk Factors", f"Multiple concerns detected: {', '.join(risk_factors)}.", "Comprehensive assessment recommended.")

    return alerts_created

@csrf_exempt
def register_api(request):
    if request.method != "POST":
        return JsonResponse({"error":"Only POST allowed"}, status=405)
    body = json.loads(request.body.decode("utf-8"))
    email = body.get("email")
    full_name = body.get("fullName") or body.get("full_name")
    password = body.get("password")
    role = body.get("role", "astronaut")

    if not email or not password or not full_name:
        return JsonResponse({"error":"Missing fields"}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error":"Email already registered"}, status=400)

    user = User(full_name=full_name, email=email, role=role)
    user.set_password(password)
    user.save()

    return JsonResponse({"status":"ok", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}})

@csrf_exempt
def login_api(request):
    if request.method != "POST":
        return JsonResponse({"error":"Only POST allowed"}, status=405)
    body = json.loads(request.body.decode("utf-8"))
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        return JsonResponse({"error":"Missing fields"}, status=400)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({"error":"Invalid credentials"}, status=400)
    if not user.check_password(password):
        return JsonResponse({"error":"Invalid credentials"}, status=400)

    return JsonResponse({"status":"ok", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}})

@csrf_exempt
def vitals_api(request):
    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))
        user_id = body.get("userId") or body.get("astronaut")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error":"User not found"}, status=400)

        vr = VitalReading.objects.create(
            user=user,
            heart_rate = int(body.get("heart_rate") or body.get("heartRate")),
            systolic = int(body.get("systolic")),
            diastolic = int(body.get("diastolic")),
            oxygen_level = int(body.get("oxygen") or body.get("oxygenSat") or body.get("oxygen_level")),
            temperature = float(body.get("temperature")),
            stress_level = int(body.get("stress") or body.get("stressLevel")),
        )

        alerts = simple_alerts_from_vitals(user, {
            "heart_rate": vr.heart_rate,
            "systolic": vr.systolic,
            "diastolic": vr.diastolic,
            "oxygen_level": vr.oxygen_level,
            "temperature": vr.temperature,
            "stress_level": vr.stress_level
        })

        return JsonResponse({"status":"ok", "vital_id": vr.id, "alerts": alerts})

    if request.method == "GET":
        user_id = request.GET.get("user_id") or request.GET.get("astronaut")
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error":"User not found"}, status=400)
            vitals = list(user.vitals.order_by("-timestamp").values())
            return JsonResponse({"status":"ok", "vitals": vitals})
        else:
            users = User.objects.all()
            data = []
            for u in users:
                latest = u.vitals.order_by("-timestamp").first()
                if latest:
                    data.append({
                        "id": u.id,
                        "name": u.full_name,
                        "mission": getattr(u, "mission", "Unknown"),
                        "heart_rate": latest.heart_rate,
                        "oxygen": latest.oxygen_level,
                        "temperature": latest.temperature,
                        "stress": latest.stress_level,
                        "lastUpdate": latest.timestamp.isoformat(),
                        "status": "critical" if latest.oxygen_level < 90 else "warning" if latest.stress_level > 7 else "normal"
                    })
            return JsonResponse({"status":"ok", "astronauts": data})

@csrf_exempt
def admin_stats(request):
    total_astronauts = User.objects.filter(role="astronaut").count()
    critical_alerts = Alert.objects.filter(level="critical").count()
    latest = VitalReading.objects.order_by("-timestamp").first()
    last_update = latest.timestamp.strftime("%H:%M") if latest else "--:--"
    return JsonResponse({
        "status":"ok",
        "totalAstronauts": total_astronauts,
        "activeMissions": total_astronauts,  # placeholder; adapt later
        "criticalAlerts": critical_alerts,
        "lastUpdate": last_update
    })

@csrf_exempt
def vitals_overview(request):
    users = User.objects.filter(role="astronaut")
    data = []
    for u in users:
        latest = u.vitals.order_by("-timestamp").first()
        if latest:
            data.append({
                "id": u.id,
                "name": u.full_name,
                "mission": getattr(u, "mission", "Unknown"),
                "heart_rate": latest.heart_rate,
                "oxygen": latest.oxygen_level,
                "temperature": latest.temperature,
                "stress": latest.stress_level,
                "lastUpdate": latest.timestamp.isoformat(),
                "status": "critical" if latest.oxygen_level < 90 else "warning" if latest.stress_level > 7 else "normal"
            })
    return JsonResponse({"status":"ok", "astronauts": data})

@csrf_exempt
def recent_alerts(request):
    alerts = Alert.objects.order_by("-timestamp")[:20]
    data = [{
        "astronaut": a.user.full_name,
        "level": a.level,
        "title": a.title,
        "message": a.message,
        "recommendation": a.recommendation,
        "timestamp": a.timestamp.isoformat()
    } for a in alerts]
    return JsonResponse({"status":"ok", "alerts": data})
