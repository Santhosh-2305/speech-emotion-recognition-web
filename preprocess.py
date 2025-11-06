import os
import numpy as np
import librosa

# Parameters
SR = 16000       # sample rate
N_MFCC = 40      # number of MFCCs
FIXED_DURATION = 3  # seconds (pad/trim all audio to 3 sec)

DATASET_PATH = "dataset/"
OUTPUT_FILE = "features.npy"

X, y = [], []   # features and labels

# Map emotion folders to numbers
label_map = {"neutral": 0, "happy": 1, "sad": 2, "angry": 3}

for emotion, label in label_map.items():
    folder = os.path.join(DATASET_PATH, emotion)
    for file in os.listdir(folder):
        if file.endswith(".wav"):
            file_path = os.path.join(folder, file)

            # Load audio
            signal, sr = librosa.load(file_path, sr=SR)

            # Trim silence & normalize
            signal, _ = librosa.effects.trim(signal)
            signal = librosa.util.normalize(signal)

            # Pad/trim to fixed length
            fixed_length = SR * FIXED_DURATION
            signal = librosa.util.fix_length(signal, size=fixed_length)

            # Extract MFCCs
            mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=N_MFCC)
            mfcc = np.mean(mfcc.T, axis=0)  # average over time

            X.append(mfcc)
            y.append(label)


X = np.array(X)
y = np.array(y)

# Save preprocessed data
np.save("X_features.npy", X)
np.save("y_labels.npy", y)

print("✅ Preprocessing complete!")
print("Features shape:", X.shape)
print("Labels shape:", y.shape)
