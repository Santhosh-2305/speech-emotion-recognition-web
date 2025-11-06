import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
from tensorflow.keras.models import load_model
from sklearn.model_selection import train_test_split
import librosa
import os

# -----------------------------
# Parameters
# -----------------------------
DATASET_PATH = "dataset/"   # make sure your dataset is in this folder
SR = 16000
N_MFCC = 40
EMOTIONS = ["neutral", "happy", "sad", "angrys"]

# -----------------------------
# Load model
# -----------------------------
model = load_model("speech_emotion_model.h5")

# -----------------------------
# Feature extraction
# -----------------------------
def extract_features(file_path):
    audio, _ = librosa.load(file_path, sr=SR)
    mfcc = librosa.feature.mfcc(y=audio, sr=SR, n_mfcc=N_MFCC)
    return mfcc.T[:40]  # keep fixed size (40,40)

X, y = [], []

for idx, emotion in enumerate(EMOTIONS):
    folder = os.path.join(DATASET_PATH, emotion)
    for file in os.listdir(folder):
        if file.endswith(".wav"):
            features = extract_features(os.path.join(folder, file))
            X.append(features)
            y.append(idx)

X = np.array(X)
y = np.array(y)

# Train-test split (same as training)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Reshape for model input
X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

# -----------------------------
# Confusion Matrix
# -----------------------------
y_pred = np.argmax(model.predict(X_test), axis=1)
cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(6,5))
sns.heatmap(cm, annot=True, fmt="d", xticklabels=EMOTIONS, yticklabels=EMOTIONS, cmap="Blues")
plt.ylabel("True Label")
plt.xlabel("Predicted Label")
plt.title("Confusion Matrix")
plt.savefig("confusion_matrix.png", dpi=300, bbox_inches='tight')
plt.show()

print("✅ Confusion matrix saved as 'confusion_matrix.png'")
