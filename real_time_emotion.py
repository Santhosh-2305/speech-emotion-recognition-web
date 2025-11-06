# real_time_emotion.py

import sounddevice as sd
import numpy as np
import librosa
from tensorflow.keras.models import load_model

# ---------------- Parameters ---------------- #
SR = 16000          # Sampling rate
DURATION = 2        # Duration to record in seconds
N_MFCC = 40         # Number of MFCC features
MODEL_PATH = "speech_emotion_model.h5"  # Path to your trained model
EMOTIONS = ['neutral', 'happy', 'sad', 'angry']  # Your emotion classes

# ---------------- Load Model ---------------- #
print("Loading model...")
model = load_model(MODEL_PATH)
print("✅ Model loaded!")

# ---------------- Record Audio ---------------- #
def record_audio(duration=DURATION, sr=SR):
    print("Recording...")
    audio = sd.rec(int(duration * sr), samplerate=sr, channels=1)
    sd.wait()
    audio = audio.flatten()
    print("Recording complete")
    return audio

# ---------------- Extract Features ---------------- #
def extract_features(y, sr=SR, n_mfcc=N_MFCC):
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    mfccs = np.mean(mfccs.T, axis=0)
    return mfccs

# ---------------- Real-time Prediction ---------------- #
print("\nStarting real-time emotion detection. Press Ctrl+C to stop.\n")
try:
    while True:
        # Record audio
        audio = record_audio()

        # Extract features
        features = extract_features(audio)
        features = features.reshape(1, -1)  # Reshape for model input

        # Predict emotion
        prediction = model.predict(features)
        predicted_emotion = EMOTIONS[np.argmax(prediction)]
        print(f"Predicted Emotion: {predicted_emotion}\n")

except KeyboardInterrupt:
    print("\nStopped real-time detection.")
