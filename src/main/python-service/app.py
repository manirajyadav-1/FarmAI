import os
import tensorflow as tf
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from flask_cors import CORS
from gem import fetch_definition_data  


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  

# Configure upload folder and allowed file types
UPLOAD_FOLDER = '/Users/manirajyadav/Desktop/SpringBoot/Crop-Disease-Detection/static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Define class labels for predictions
class_indices = {
    0: 'Apple___Apple_scab',
    1: 'Apple___Black_rot',
    2: 'Apple___Cedar_apple_rust',
    3: 'Apple___healthy',
    4: 'Background_without_leaves',
    5: 'Blueberry___healthy',
    6: 'Cherry___Powdery_mildew',
    7: 'Cherry___healthy',
    8: 'Corn___Cercospora_leaf_spot Gray_leaf_spot',
    9: 'Corn___Common_rust',
    10: 'Corn___Northern_Leaf_Blight',
    11: 'Corn___healthy',
    12: 'Grape___Black_rot',
    13: 'Grape___Esca_(Black_Measles)',
    14: 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    15: 'Grape___healthy',
    16: 'Orange___Haunglongbing_(Citrus_greening)',
    17: 'Peach___Bacterial_spot',
    18: 'Peach___healthy',
    19: 'Pepper_bell___Bacterial_spot',
    20: 'Pepper_bell___healthy',
    21: 'Potato___Early_blight',
    22: 'Potato___Late_blight',
    23: 'Potato___healthy',
    24: 'Raspberry___healthy',
    25: 'Soybean___healthy',
    26: 'Squash___Powdery_mildew',
    27: 'Strawberry___Leaf_scorch',
    28: 'Strawberry___healthy',
    29: 'Tomato___Bacterial_spot',
    30: 'Tomato___Early_blight',
    31: 'Tomato___Late_blight',
    32: 'Tomato___Leaf_Mold',
    33: 'Tomato___Septoria_leaf_spot',
    34: 'Tomato___Spider_mites_Two-spotted_spider_mite',
    35: 'Tomato___Target_Spot',
    36: 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    37: 'Tomato___Tomato_mosaic_virus',
    38: 'Tomato___healthy'
}

# Load the trained model
MODEL_PATH = "/Users/manirajyadav/Desktop/SpringBoot/Crop-Disease-Detection/src/main/resources/model/plant_disease_model.h5"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = tf.keras.models.load_model(MODEL_PATH)

# Helper function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to preprocess the uploaded image
def preprocess_image(filepath):
    img = load_img(filepath, target_size=(224, 224))
    img_array = img_to_array(img) / 255.0  # Normalize pixel values
    img_array = img_array.reshape((1,) + img_array.shape)  # Reshape for model input
    return img_array

# API Endpoint: Predict Disease from Image
@app.route('/api/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            img_array = preprocess_image(filepath)
            prediction = model.predict(img_array)
            predicted_class = prediction.argmax(axis=-1)[0]

            # Convert predicted index to disease label
            predicted_label = class_indices.get(predicted_class, "Unknown Disease")
            predicted_label = (
                predicted_label.replace(",", " ")  
                .replace("_", " ")                  
                .replace("-", " ")                  
                .strip()                             
            )

            # Fetch additional suggestions using Gemini API
            suggestions = fetch_definition_data(predicted_label)

            return jsonify({"disease": predicted_label, "suggestions": suggestions})
        except Exception as e:
            return jsonify({"error": f"Error processing image: {str(e)}"}), 500
    else:
        return jsonify({"error": "Invalid file type"}), 400

# API Endpoint: Fetch Disease Details from Gemini API
@app.route('/api/gemini', methods=['POST'])
def get_gemini_suggestions():
    data = request.get_json()
    
    if not data or "disease_name" not in data:
        return jsonify({"error": "Missing disease_name in request body"}), 400

    disease_name = data["disease_name"]
    
    try:
        suggestions = fetch_definition_data(disease_name)
        return jsonify({"disease": disease_name, "suggestions": suggestions})
    except Exception as e:
        return jsonify({"error": f"Error fetching suggestions: {str(e)}"}), 500

# Run the Flask server
if __name__ == "__main__":
    app.run(debug=True, port=4000)
