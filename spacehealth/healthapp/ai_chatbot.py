import os
import uuid
import pickle
import pyttsx3
from django.conf import settings
from .models import ChatHistory, Session, VitalLog, RadiationLog

# ✅ Load your ML health model
MODEL_PATH = os.path.join(settings.BASE_DIR, "health_model.pkl")
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        health_model = pickle.load(f)
else:
    health_model = None
    print("⚠️ Warning: health_model.pkl not found. Predictions disabled.")

# ✅ Setup TTS engine (female voice)
engine = pyttsx3.init()
voices = engine.getProperty("voices")
for v in voices:
    if "female" in v.name.lower() or "zira" in v.name.lower():
        engine.setProperty("voice", v.id)
        break
engine.setProperty("rate", 170)


def generate_tts(text):
    """Generate TTS audio file and return URL"""
    audio_dir = os.path.join(settings.BASE_DIR, "spacehealth", "static", "audio")
    os.makedirs(audio_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(audio_dir, filename)

    engine.save_to_file(text, filepath)
    engine.runAndWait()

    return f"/static/audio/{filename}"


def predict_health_risk(session_id):
    """Use vitals + radiation logs + ML model to predict health risk"""
    try:
        vitals = VitalLog.objects.filter(session_id=session_id).last()
        radiation = RadiationLog.objects.filter(session_id=session_id).last()

        if not vitals or not radiation or not health_model:
            return None

        # Example features (adjust to match your trained model input order)
        features = [
            vitals.heart_rate,
            vitals.oxygen_saturation,
            vitals.blood_pressure,
            vitals.temperature,
            radiation.dose_rate,
            radiation.cumulative_dose,
        ]

        prediction = health_model.predict([features])[0]
        return prediction

    except Exception as e:
        print("⚠️ Prediction error:", e)
        return None


def get_chatbot_response(session_id, user_message):
    """Handles chatbot conversation with ML-powered risk prediction"""
    try:
        session = Session.objects.get(id=session_id)
    except Session.DoesNotExist:
        return {"response": "No active session found.", "audio_url": None}

    # ✅ Integrate ML risk prediction
    risk = predict_health_risk(session_id)

    if risk == 1:
        ai_note = "⚠️ Based on your vitals, you are at moderate risk. Please rest, hydrate, and avoid strenuous activity."
    elif risk == 2:
        ai_note = "🚨 Warning: Your vitals suggest a high-risk condition. Please follow safety procedures and alert mission control."
    else:
        ai_note = "✅ Your vitals look stable. Keep monitoring regularly."

    # ✅ Combine with chatbot empathy
    if "stress" in user_message.lower():
        response = "I hear that you're feeling stressed. Let's take a deep breath together. " + ai_note
    elif "heart" in user_message.lower():
        response = "I’ll monitor your heart closely. " + ai_note
    elif "radiation" in user_message.lower():
        response = "Radiation exposure is being tracked. " + ai_note
    else:
        response = "I understand. " + ai_note

    # ✅ Generate TTS
    audio_url = generate_tts(response)

    # ✅ Save chat
    ChatHistory.objects.create(
        session=session,
        user_message=user_message,
        bot_response=response
    )

    return {"response": response, "audio_url": audio_url}
