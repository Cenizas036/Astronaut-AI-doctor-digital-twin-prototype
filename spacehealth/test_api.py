# test_api.py (place next to manage.py)
import requests

BASE = "http://127.0.0.1:8000/api"

# Predict test
resp = requests.post(BASE + "/predict/", json={
    "heart_rate": 85,
    "oxygen_level": 92,
    "sleep_hours": 5,
    "stress_level": 4
})
print("PREDICT", resp.status_code, resp.json())

# Chatbot test
resp = requests.post(BASE + "/chatbot/", json={"message": "I feel stress and tired"})
print("CHATBOT", resp.status_code, resp.json())
