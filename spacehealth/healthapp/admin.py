from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Session, VitalLog, RadiationLog, ChatHistory

# ✅ Custom User Admin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Extra Info", {"fields": ("role",)}),
    )
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email")


# ✅ Session Admin
@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "started_at", "ended_at")
    list_filter = ("started_at", "ended_at")
    search_fields = ("user__username",)


# ✅ VitalLog Admin
@admin.register(VitalLog)
class VitalLogAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "heart_rate", "oxygen_saturation", "blood_pressure", "temperature", "created_at")
    list_filter = ("created_at",)
    search_fields = ("session__user__username",)


# ✅ RadiationLog Admin
@admin.register(RadiationLog)
class RadiationLogAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "dose_rate", "cumulative_dose", "exposure_duration", "event_type", "alert_level", "created_at")
    list_filter = ("alert_level", "event_type", "created_at")
    search_fields = ("session__user__username",)


# ✅ ChatHistory Admin (FIXED FIELD NAMES)
@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "user_message", "bot_response", "timestamp")
    list_filter = ("timestamp",)
    search_fields = ("session__user__username", "user_message", "bot_response")
