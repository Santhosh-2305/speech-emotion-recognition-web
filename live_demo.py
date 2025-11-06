import sounddevice as sd
import librosa
import numpy as np
from tensorflow.keras.models import load_model

# Load trained model
model = load_model("emotion_model.h5")

# Emotion labels (same order as training)
EMOTIONS = ["neutral", "happy", "sad", "angry"]

# Record live audio
duration = 3  # seconds
sr = 16000
print("🎙️ Speak now...")
audio = sd.rec(int(duration * sr), samplerate=sr, channels=1, dtype='float32')
sd.wait()

# Preprocess audio (same as training)
audio = audio.flatten()
audio, _ = librosa.effects.trim(audio)  # trim silence
audio = librosa.util.normalize(audio)   # normalize
audio = librosa.util.fix_length(audio, size=sr * duration)  # fixed length

# Extract features (same as training)
mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
mfcc = np.mean(mfcc.T, axis=0)  # average over time like in training
mfcc = mfcc.reshape(1, 40, 1)  # reshape for CNN input

# Predict
prediction = model.predict(mfcc)
emotion = EMOTIONS[np.argmax(prediction)]

print("✅ Detected Emotion:", emotion)
