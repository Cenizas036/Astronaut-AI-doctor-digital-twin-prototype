@echo off
echo =====================================
echo 🚀 Setting up Astro Digital Twin Env
echo =====================================

:: Create conda env with Python 3.10
conda create -y -n astro_ai python=3.10
call conda activate astro_ai

:: Install Django + REST + WebSockets
pip install django djangorestframework channels daphne

:: ML & Data Science
pip install scikit-learn joblib numpy pandas

:: Speech-to-Text (Whisper optimized for CPU)
pip install faster-whisper==0.10.0 sounddevice soundfile

:: Natural Language Processing
pip install spacy
python -m spacy download en_core_web_sm

:: Text-to-Speech (offline, lightweight)
pip install pyttsx3

:: Optional scraping + testing
pip install requests beautifulsoup4 pytest

echo =====================================
echo ✅ Setup complete. Activate using:
echo conda activate astro_ai
echo =====================================
pause
