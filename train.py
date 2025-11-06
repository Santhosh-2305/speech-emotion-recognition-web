import os
# ✅ Disable oneDNN optimizations (fixes OverflowError on Windows)
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Dense, Dropout
from tensorflow.keras.utils import to_categorical

# Load preprocessed features
X = np.load("X_features.npy")
y = np.load("y_labels.npy")

print("Data loaded:", X.shape, y.shape)

# Convert to float32 for TensorFlow
X = X.astype("float32")

# Reshape X for CNN input (samples, features, channels)
X = X.reshape(X.shape[0], X.shape[1], 1)

# One-hot encode labels
y = to_categorical(y, num_classes=4).astype("float32")


# Build CNN + LSTM model
model = Sequential([
    Conv1D(64, kernel_size=3, activation='relu', input_shape=(40, 1)),
    MaxPooling1D(pool_size=2),
    LSTM(64, return_sequences=False),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dense(4, activation='softmax')
])

model.compile(loss='categorical_crossentropy',
              optimizer='adam',
              metrics=['accuracy'])

# Train model
history = model.fit(X, y, epochs=30, batch_size=32, validation_split=0.2)

# Save trained model
model.save("emotion_model.h5")
print("✅ Model training complete! Saved as emotion_model.h5")
