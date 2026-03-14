from django.db import models
from django.contrib.auth.models import AbstractUser

# ✅ Custom User Model
class CustomUser(AbstractUser):
    role = models.CharField(
        max_length=50,
        choices=(
            ("astronaut", "Astronaut"),
            ("admin", "Admin"),
        ),
        default="astronaut",
    )

    # 🔹 New field: Gender (male/female/other)
    gender = models.CharField(
        max_length=10,
        choices=(
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
        ),
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# ✅ Session Model
class Session(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session {self.id} - {self.user.username}"


# ✅ Vital Log Model (ENHANCED with new vitals)
class VitalLog(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    heart_rate = models.FloatField()
    oxygen_saturation = models.FloatField()
    blood_pressure = models.FloatField()
    temperature = models.FloatField()

    # 🔹 New fields
    respiration_rate = models.FloatField(null=True, blank=True)
    core_temperature = models.FloatField(null=True, blank=True)
    skin_temperature = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vitals (Session {self.session.id}) - HR {self.heart_rate}"


# ✅ Radiation Log Model
class RadiationLog(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    dose_rate = models.FloatField()
    cumulative_dose = models.FloatField()
    exposure_duration = models.FloatField()
    event_type = models.CharField(max_length=100, default="unknown")
    alert_level = models.CharField(
        max_length=20,
        choices=(
            ("green", "Green"),
            ("yellow", "Yellow"),
            ("red", "Red"),
        ),
        default="green",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Radiation (Session {self.session.id}) - {self.alert_level}"


# ✅ Chat History Model
class ChatHistory(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    user_message = models.TextField()
    bot_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat (Session {self.session.id})"


# ✅ Alert Log Model (stores warnings sent to space station)
class AlertLog(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=100)   # e.g. "Vitals", "Radiation"
    message = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=(
            ("warning", "Warning"),
            ("critical", "Critical"),
        ),
        default="warning",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert (Session {self.session.id}) - {self.severity.upper()}"
