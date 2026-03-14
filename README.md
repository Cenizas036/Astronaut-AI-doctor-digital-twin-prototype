# 🚀 Astronaut Digital Twin – AI Health Assistant (SIH 2025)

## Overview

Astronaut Digital Twin is an AI-powered health monitoring assistant designed to simulate a virtual medical companion for astronauts during space missions.

The system analyzes astronaut symptoms, predicts potential health conditions using a machine learning model, and responds through speech interaction. It acts as a prototype for intelligent onboard medical support where communication delays with Earth make immediate medical assistance difficult.

The system is designed to evolve into a **physiology-aware digital twin**, capable of adapting health analysis based on biological differences such as **male physiology, female physiology, and future support for post-pregnancy conditions in astronauts.**

---

## Key Features

🎙 Voice-based astronaut interaction
🧠 Machine learning health condition prediction
🗣 AI text-to-speech responses
📊 Symptom analysis using trained models
🧪 Offline-capable AI assistant
👨‍🚀 Digital twin simulation for astronaut health monitoring
⚕️ Physiology-aware health modeling (male and female differences)

---

## Physiological Adaptation

Human physiology responds differently to space environments depending on biological factors.

This system is designed to support **physiology-specific health analysis**.

### Current considerations

* Male physiology health modeling
* Female physiology health modeling
* Hormonal and metabolic differences
* Space adaptation differences between biological sexes

### Future extension

* Post-pregnancy physiological monitoring
* Hormonal recovery considerations
* Long-term bone density and muscle recovery tracking
* Personalized health monitoring for astronauts returning from maternity-related physiological changes

These improvements move the system toward a **true personalized digital twin for astronaut health**.

---

## Project Structure

```
SIH/
│
├── astronaut_health_ai.py
├── health_condition_model.joblib
├── vectorizer.joblib
│
├── models/
├── samples/
│
├── coqui_env_new/
│
├── output.wav
├── response.wav
├── tts_output.wav
│
├── test1.py
├── test2.py
├── test3.py
├── test4.py
├── test5.py
├── test6.py
├── test7.py
├── test8.py
├── test9.py
├── test10.py
├── test11.py
│
├── testalt.py
└── pylearn.py
```

---

## Technologies Used

### Programming

Python

### Machine Learning

Scikit-learn
Joblib

### Speech and Audio

Coqui TTS
Python audio processing

### AI Concepts

Digital Twin Simulation
Health Condition Prediction
Speech Interaction Systems

---

## How the System Works

1. The astronaut provides symptoms or health information.
2. The system converts symptoms into numerical features using a trained vectorizer.
3. A machine learning model predicts potential health conditions.
4. The AI assistant generates an appropriate response.
5. The response is converted into speech using text-to-speech.
6. The system can later adapt predictions based on astronaut physiological profiles.

This simulates a **virtual medical assistant for astronauts in deep-space missions.**

---

## Running the Project

Run the main assistant:

```
python astronaut_health_ai.py
```

The system will analyze input symptoms and produce an AI-generated health response.

---

## Future Improvements

* Integration with real astronaut biometric data
* Advanced physiological modeling
* Post-pregnancy health monitoring module
* Space telemetry integration
* Real-time astronaut health dashboards
* Improved speech recognition
* Deep learning based health prediction models

---

## Potential Applications

* Long-duration space missions
* Autonomous onboard medical systems
* Digital twin health monitoring for astronauts
* AI-driven medical support in remote environments
* Space medicine research

---

## Vision

The long-term goal is to create a **fully adaptive digital twin system that continuously models an astronaut’s health in space**, adjusting predictions and recommendations based on biological differences, mission conditions, and personal health history.

---

## Author

Developed as part of an AI-based astronaut health monitoring project exploring digital twin technology and intelligent medical assistance for space missions.
