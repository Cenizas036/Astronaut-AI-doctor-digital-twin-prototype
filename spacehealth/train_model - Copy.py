# train_model.py (put this in same folder as manage.py)
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier

X = np.array([
    [70, 98, 7, 2],
    [72, 97, 7, 2],
    [85, 92, 5, 4],
    [90, 90, 4, 5],
    [95, 88, 4, 5],
    [60, 99, 8, 1],
    [78, 95, 6, 3],
    [82, 94, 5.5, 3],
    [68, 98, 7.5, 1],
    [100, 85, 3, 6]
], dtype=float)

y = np.array([0, 0, 1, 1, 2, 0, 1, 1, 0, 2])  # 0=Healthy,1=Fatigue,2=Stress

model = RandomForestClassifier(n_estimators=30, random_state=42)
model.fit(X, y)

with open("health_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ health_model.pkl created in project root")
