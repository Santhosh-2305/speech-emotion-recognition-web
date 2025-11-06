import numpy as np
from tensorflow.keras.models import load_model

# Test model loading and basic functionality
try:
    model = load_model("emotion_model.h5")
    print("✅ Model loaded successfully!")
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
    
    # Test with dummy data
    dummy_input = np.random.random((1, 40, 1))
    prediction = model.predict(dummy_input, verbose=0)
    print(f"✅ Model prediction works! Output shape: {prediction.shape}")
    
    # Check emotion labels
    EMOTIONS = ["neutral", "happy", "sad", "angry"]
    predicted_emotion = EMOTIONS[np.argmax(prediction)]
    print(f"✅ Predicted emotion (dummy): {predicted_emotion}")
    print(f"✅ Prediction probabilities: {prediction[0]}")
    
except Exception as e:
    print(f"❌ Error: {e}")