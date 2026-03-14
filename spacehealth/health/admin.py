from django.contrib import admin
from .models import User, VitalReading, Alert

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'role', 'created_at')
    search_fields = ('email', 'full_name')

@admin.register(VitalReading)
class VitalAdmin(admin.ModelAdmin):
    list_display = ('user', 'heart_rate', 'oxygen_level', 'timestamp')
    list_filter = ('timestamp',)

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'level', 'title', 'timestamp')
    list_filter = ('level', 'timestamp')
