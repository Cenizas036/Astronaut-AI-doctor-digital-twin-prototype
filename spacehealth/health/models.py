from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password

class User(models.Model):
    ROLE_CHOICES = (('astronaut','Astronaut'), ('admin','Admin'))

    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # hashed
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='astronaut')
    created_at = models.DateTimeField(default=timezone.now)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class VitalReading(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vitals")
    heart_rate = models.IntegerField()
    systolic = models.IntegerField()
    diastolic = models.IntegerField()
    oxygen_level = models.IntegerField()
    temperature = models.FloatField()
    stress_level = models.IntegerField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


class Alert(models.Model):
    LEVEL_CHOICES = (('critical','Critical'), ('warning','Warning'), ('info','Info'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alerts")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    recommendation = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.level.upper()} - {self.title} ({self.user.email})"
