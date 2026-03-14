import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

# Dummy dataset: [heart_rate, oxygen_level, sleep_hours, stress_level]
X = np.array([
    [70, 98, 7, 2],   # Healthy
    [85, 92, 5, 4],   # Fatigue
    [95, 88, 4, 5],   # Stress Risk
    [60, 99, 8, 1],   # Healthy
    [78, 95, 6, 3],   # Slight risk
])
y = np.array([0, 1, 2, 0, 1])  # 0=Healthy,1=Fatigue,2=Stress

model = RandomForestClassifier(n_estimators=20, random_state=42)
model.fit(X, y)

model_path = os.path.join(os.path.dirname(__file__), "health_model.pkl")
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print("✅ Model trained and saved at:", model_path)