# spacehealth/urls.py
from django.contrib import admin
from django.urls import path, include
from healthapp import views as health_views
from django.contrib.auth.views import LogoutView   # ✅ import built-in logout

urlpatterns = [
    # Admin site
    path("admin/", admin.site.urls),

    # Home / index
    path("", health_views.index, name="home"),

    # Authentication (login, logout, register)
    path("login/", health_views.CustomLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(next_page="home"), name="logout"),  # ✅ fixed logout
    path("register/", health_views.register, name="register"),

    # Healthapp routes (API + dashboards + session)
    path("", include("healthapp.urls")),
]
