import numpy as np
import librosa
from tensorflow.keras.models import load_model

SR = 16000  
# Load your trained model

model = load_model("emotion_model.h5")
print("✅ Model loaded!")

# Map indices to emotion labels
# Make sure this matches your training label order

EMOTIONS = ["neutral", "happy", "sad", "angry"]

# Feature extraction function
def extract_features(file_path, sr=SR):
    audio, sr = librosa.load(file_path, sr=sr)
    
    # Trim silence & normalize (same as training)
    audio, _ = librosa.effects.trim(audio)
    audio = librosa.util.normalize(audio)
    
    # Pad/trim to fixed length (3 seconds)
    fixed_length = sr * 3
    audio = librosa.util.fix_length(audio, size=fixed_length)
    
    # Extract MFCCs
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    mfccs = np.mean(mfccs.T, axis=0)  # average over time
    return mfccs
# Prediction function
def predict_emotion(file_path):
    features = extract_features(file_path)
    # Reshape for CNN input (same as training)
    features = features.reshape(1, 40, 1)
    preds = model.predict(features)
    predicted_label = np.argmax(preds)
    return preds, predicted_label

# Main

if __name__ == "__main__":
    # 🔹 Path to your test audio file
    test_file = "test_audio/neutral.wav"  # <-- update if needed

    preds, label = predict_emotion(test_file)
    
    print("🔹 Probabilities:", preds)
    print("🎤 Predicted Emotion:", EMOTIONS[label])
    
    # 🔹 Print top 2 emotions with their probabilities
    top_indices = preds[0].argsort()[-2:][::-1]  # indices of top 2
    print("\nTop 2 emotions:")
    for i in top_indices:
        print(f"{EMOTIONS[i]}: {preds[0][i]:.2f}")
