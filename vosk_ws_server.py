import os
import sys
import json
import queue
import asyncio
import websockets
import sounddevice as sd
from vosk import Model, KaldiRecognizer
import requests

# ✅ Django setup
import django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "spacehealth.settings")
django.setup()

# -----------------------------
# Vosk Configuration
# -----------------------------
MODEL_PATH = os.path.join("models", "vosk-model-small-en-us-0.15")
if not os.path.exists(MODEL_PATH):
    print("❌ Please download a Vosk model and place it in /models/")
    sys.exit(1)

model = Model(MODEL_PATH)

# -----------------------------
# WebSocket + Audio
# -----------------------------
q = queue.Queue()

def callback(indata, frames, time, status):
    """Audio input callback for microphone"""
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))


async def recognize(websocket):
    rec = KaldiRecognizer(model, 16000)
    loop = asyncio.get_event_loop()

    # Start microphone
    with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype="int16",
                           channels=1, callback=callback):
        print("🎙️ Microphone active, waiting for speech...")

        while True:
            data = await loop.run_in_executor(None, q.get)
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                if result.get("text"):
                    print("🧑 Astronaut:", result["text"])
                    await websocket.send(json.dumps({"text": result["text"]}))

            else:
                partial = json.loads(rec.PartialResult())
                if partial.get("partial"):
                    await websocket.send(json.dumps({"partial": partial["partial"]}))


async def main():
    async with websockets.serve(recognize, "0.0.0.0", 2700):
        print("✅ Vosk WebSocket server started on ws://0.0.0.0:2700")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("❌ Server stopped")

