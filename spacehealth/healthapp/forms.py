from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

# ✅ Custom User Creation Form
class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, label="Email Address")
    role = forms.ChoiceField(
        choices=(
            ("astronaut", "Astronaut"),
            ("admin", "Admin"),
        ),
        required=True,
        label="Register as",
    )
    gender = forms.ChoiceField(
        choices=(
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
        ),
        required=False,
        label="Gender",
    )

    class Meta:
        model = User
        fields = ("username", "email", "role", "gender", "password1", "password2")
