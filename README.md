# 🚀 Astronaut Digital Twin – AI Health Monitoring System (SIH 2025)

## Overview

Astronaut Digital Twin is an AI-powered health assistant designed to simulate a **virtual medical companion for astronauts during space missions**.

The system analyzes astronaut symptoms using machine learning models, generates possible health condition predictions, and responds through **speech interaction and a web interface**. It acts as a prototype for intelligent onboard medical support where direct communication with Earth may be delayed.

The project aims to evolve into a **physiology-aware digital twin**, capable of adapting health analysis based on biological differences such as **male physiology, female physiology, and future support for post-pregnancy astronaut health monitoring**.

---

# 🎯 Objectives

* Provide AI-assisted health monitoring for astronauts
* Simulate a digital twin for astronaut health status
* Enable voice-based interaction for quick symptom reporting
* Provide a web dashboard for health insights
* Adapt predictions based on physiological differences
* Build an offline-capable medical support prototype for deep-space missions

---

# ✨ Key Features

🎙 Voice-based astronaut interaction
🧠 Machine learning health condition prediction
🗣 Text-to-speech AI responses
🌐 Web interface for monitoring and interaction
📊 Symptom analysis using trained ML models
🧪 Offline-capable system for space environments
⚕️ Physiology-aware modeling (male & female differences)

---

# 🧬 Physiological Adaptation

Human physiology behaves differently in space depending on biological factors.

This system is designed to support **physiology-specific health analysis**.

### Current considerations

* Male astronaut physiology
* Female astronaut physiology
* Hormonal and metabolic differences
* Different adaptation responses in microgravity

### Future expansion

* Post-pregnancy astronaut health monitoring
* Hormonal recovery analysis
* Bone density recovery tracking
* Personalized astronaut health models

This approach moves the project closer to a **true personalized digital twin for astronaut health monitoring**.

---

# 🧠 Technologies Used

### Programming

* Python

### Machine Learning

* Scikit-learn
* Joblib

### Speech Processing

* Vosk Speech Recognition
* Coqui / TTS systems

### Web Technologies

* HTML
* CSS
* JavaScript

### AI Concepts

* Digital Twin Systems
* Health Prediction Models
* Speech Interaction Systems
* Physiological Adaptation Modeling

---

# 📂 Project Structure

```
SIH/
│
├── AstroDigTwin/                     # AI Digital Twin core system
│   │
│   ├── models/                       # Speech recognition model
│   │   └── vosk-model-small-en-us-0.15/
│   │        ├── am/
│   │        ├── conf/
│   │        ├── graph/
│   │        └── ivector/
│   │
│   ├── astronaut_health_ai.py        # Main AI assistant
│   ├── health_condition_model.joblib # Trained ML model
│   ├── vectorizer.joblib             # Text vectorizer
│   ├── output.wav                    # Generated audio
│   ├── response.wav                  # AI response speech
│   ├── tts_output.wav                # Text-to-speech output
│   ├── test1.py - test11.py          # Experimental scripts
│   └── pylearn.py                    # ML experimentation
│
│
└── spacehealth/                      # Web application interface
    │
    ├── assets/                      # Images and media
    ├── css/                         # Styling files
    ├── js/                          # JavaScript logic
    ├── frontend/                    # UI components
    ├── pages/                       # Web pages
    ├── templates/                   # HTML templates
    ├── static/                      # Static resources
    ├── health/                      # Health analysis modules
    └── healthapp/                   # Backend logic
```

---

# ⚙️ How the System Works

1️⃣ Astronaut provides symptoms via voice or interface
2️⃣ Speech recognition converts voice to text
3️⃣ Symptoms are vectorized using a trained feature extractor
4️⃣ Machine learning model predicts possible health conditions
5️⃣ AI assistant generates a response
6️⃣ Response is converted to speech using TTS
7️⃣ Web interface displays the results and health insights

This creates a **virtual AI medical assistant for astronauts**.

---

# ▶ Running the Project

Run the AI assistant:

```
python astronaut_health_ai.py
```

The system will analyze symptoms and generate a health response.

---

# 🚀 Future Improvements

* Integration with astronaut biometric sensors
* Real-time telemetry integration
* Deep learning health prediction models
* Improved speech recognition
* Astronaut health dashboards
* Advanced digital twin modeling
* Space mission telemetry integration

---

# 🌌 Potential Applications

* Long-duration space missions
* Mars mission medical support
* Autonomous spacecraft health systems
* AI medical assistants for remote environments
* Space medicine research

---

# 🧑‍🚀 Vision

The long-term vision is to build a **fully adaptive astronaut digital twin** that continuously models astronaut health in space and provides intelligent medical assistance without needing constant communication with Earth.

---

# 📜 License

This project is developed for research and educational purposes.
