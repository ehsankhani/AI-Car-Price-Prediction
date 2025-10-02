from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import uvicorn

# 1. Initialize FastAPI app
app = FastAPI(
    title="Car Price Prediction API",
    description="An API to predict car prices using a machine learning model.",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# 2. Load the trained model
# This model is a pipeline that includes preprocessing and the regressor
import os
model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'car_price_model.joblib')
model = joblib.load(model_path)
print("Model loaded successfully.")

# 3. Define the input data model using Pydantic
# This ensures that the input data is valid
class CarFeatures(BaseModel):
    car_make: str = "Porsche"
    car_model: str = "911"
    year: int = 2022
    engine_size: float = 3.0
    horsepower: int = 379
    torque: int = 331
    zero_to_sixty_time: float = 4.0
    
    class Config:
        # Example to show in the API docs
        json_schema_extra = {
            "example": {
                "car_make": "Porsche",
                "car_model": "911",
                "year": 2022,
                "engine_size": 3.0,
                "horsepower": 379,
                "torque": 331,
                "zero_to_sixty_time": 4.0
            }
        }

# 4. Define API endpoints

@app.get("/", response_class=HTMLResponse)
def read_root():
    """
    Root endpoint that serves the main car price prediction interface.
    """
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Car Price Prediction</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 1.1em;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px;
            }
            
            .form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
            }
            
            input, select {
                width: 100%;
                padding: 12px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            
            input:focus, select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .btn {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px 30px;
                border: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
                width: 100%;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
            }
            
            .result {
                margin-top: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 5px solid #28a745;
                display: none;
            }
            
            .result.error {
                border-left-color: #dc3545;
                background: #f8d7da;
            }
            
            .price {
                font-size: 2em;
                font-weight: bold;
                color: #28a745;
                text-align: center;
                margin-top: 10px;
            }
            
            .loading {
                display: none;
                text-align: center;
                color: #667eea;
                font-weight: 600;
            }
            
            .api-links {
                margin-top: 30px;
                padding-top: 30px;
                border-top: 1px solid #e1e5e9;
                text-align: center;
            }
            
            .api-links a {
                display: inline-block;
                margin: 10px;
                padding: 10px 20px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background 0.3s ease;
            }
            
            .api-links a:hover {
                background: #5a67d8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 Car Price Predictor</h1>
                <p>Get accurate price predictions for sports cars using AI</p>
            </div>
            
            <div class="content">
                <form id="predictionForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="car_make">Car Make:</label>
                            <select id="car_make" name="car_make" required>
                                <option value="">Select Car Make</option>
                                <option value="Porsche">Porsche</option>
                                <option value="Lamborghini">Lamborghini</option>
                                <option value="Ferrari">Ferrari</option>
                                <option value="Audi">Audi</option>
                                <option value="McLaren">McLaren</option>
                                <option value="BMW">BMW</option>
                                <option value="Mercedes-Benz">Mercedes-Benz</option>
                                <option value="Chevrolet">Chevrolet</option>
                                <option value="Ford">Ford</option>
                                <option value="Nissan">Nissan</option>
                                <option value="Aston Martin">Aston Martin</option>
                                <option value="Bugatti">Bugatti</option>
                                <option value="Dodge">Dodge</option>
                                <option value="Jaguar">Jaguar</option>
                                <option value="Koenigsegg">Koenigsegg</option>
                                <option value="Lexus">Lexus</option>
                                <option value="Lotus">Lotus</option>
                                <option value="Maserati">Maserati</option>
                                <option value="Tesla">Tesla</option>
                                <option value="Rimac">Rimac</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="car_model">Car Model:</label>
                            <input type="text" id="car_model" name="car_model" placeholder="e.g., 911, Huracan, 488 GTB" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="year">Year:</label>
                            <input type="number" id="year" name="year" min="2015" max="2024" placeholder="e.g., 2022" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="engine_size">Engine Size (L):</label>
                            <select id="engine_size" name="engine_size" required>
                                <option value="">Select Engine Size</option>
                                <option value="0">Electric (0L)</option>
                                <option value="1.5">1.5L</option>
                                <option value="2.0">2.0L</option>
                                <option value="2.5">2.5L</option>
                                <option value="3.0">3.0L</option>
                                <option value="3.5">3.5L</option>
                                <option value="3.8">3.8L</option>
                                <option value="3.9">3.9L</option>
                                <option value="4.0">4.0L</option>
                                <option value="4.4">4.4L</option>
                                <option value="4.7">4.7L</option>
                                <option value="5.0">5.0L</option>
                                <option value="5.2">5.2L</option>
                                <option value="6.2">6.2L</option>
                                <option value="8.0">8.0L</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="horsepower">Horsepower:</label>
                            <input type="number" id="horsepower" name="horsepower" min="100" max="2000" placeholder="e.g., 500" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="torque">Torque (lb-ft):</label>
                            <input type="number" id="torque" name="torque" min="100" max="2000" placeholder="e.g., 400" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="zero_to_sixty_time">0-60 MPH Time (seconds):</label>
                            <input type="number" id="zero_to_sixty_time" name="zero_to_sixty_time" step="0.1" min="1" max="10" placeholder="e.g., 3.5" required>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn">🔮 Predict Price</button>
                    
                    <div class="loading" id="loading">
                        Calculating price prediction...
                    </div>
                    
                    <div class="result" id="result">
                        <h3>Predicted Price:</h3>
                        <div class="price" id="price"></div>
                    </div>
                </form>
                
                <div class="api-links">
                    <h3>API Documentation:</h3>
                    <a href="/docs" target="_blank">📖 Interactive API Docs</a>
                    <a href="/redoc" target="_blank">📋 ReDoc Documentation</a>
                    <a href="/health" target="_blank">❤️ Health Check</a>
                </div>
            </div>
        </div>

        <script>
            document.getElementById('predictionForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const loading = document.getElementById('loading');
                const result = document.getElementById('result');
                const price = document.getElementById('price');
                
                // Show loading
                loading.style.display = 'block';
                result.style.display = 'none';
                
                // Get form data
                const formData = new FormData(e.target);
                const data = {
                    car_make: formData.get('car_make'),
                    car_model: formData.get('car_model'),
                    year: parseInt(formData.get('year')),
                    engine_size: parseFloat(formData.get('engine_size')),
                    horsepower: parseInt(formData.get('horsepower')),
                    torque: parseInt(formData.get('torque')),
                    zero_to_sixty_time: parseFloat(formData.get('zero_to_sixty_time'))
                };
                
                try {
                    const response = await fetch('/predict', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const prediction = await response.json();
                    
                    if (response.ok && prediction.predicted_price_usd && !prediction.error) {
                        price.textContent = `$${prediction.predicted_price_usd.toLocaleString()}`;
                        result.className = 'result';
                        result.style.display = 'block';
                    } else {
                        throw new Error(prediction.error || 'Prediction failed');
                    }
                } catch (error) {
                    console.error('Prediction error:', error);
                    price.textContent = `Error: ${error.message || 'Unknown error occurred during prediction'}`;
                    result.className = 'result error';
                    result.style.display = 'block';
                } finally {
                    loading.style.display = 'none';
                }
            });
        </script>
    </body>
    </html>
    """
    return html_content

@app.get("/health")
def health_check():
    """
    Health check endpoint to ensure the API is running.
    """
    return {"status": "ok", "model_loaded": True, "message": "Car Price Prediction API is running!"}

@app.post("/predict")
def predict_price(features: CarFeatures):
    """
    Predicts the car price based on input features.
    """
    try:
        # Process engine size according to the training data logic
        def process_engine_size(engine_size):
            if engine_size == 0 or engine_size == 0.0:
                return "Electric"
            else:
                return str(float(engine_size))
        
        # Convert the input data into a pandas DataFrame
        # The column names must match the ones used during training
        # Apply the same preprocessing logic as used during training
        input_data = pd.DataFrame([{
            "Car Make": str(features.car_make),
            "Car Model": str(features.car_model),
            "Year": float(features.year),
            "Engine Size (L)": process_engine_size(features.engine_size),
            "Horsepower": float(features.horsepower),
            "Torque (lb-ft)": float(features.torque),
            "0-60 MPH Time (seconds)": float(features.zero_to_sixty_time)
        }])
        
        print(f"Input data for prediction: {input_data}")
        print(f"Data types: {input_data.dtypes}")
        
        # Use the loaded model pipeline to make a prediction
        # The pipeline handles preprocessing and prediction
        prediction = model.predict(input_data)
        
        # Return the prediction in a JSON response
        return {"predicted_price_usd": round(prediction[0], 2)}
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        print(f"Input data: {input_data if 'input_data' in locals() else 'Not created'}")
        return {"error": f"Prediction failed: {str(e)}", "predicted_price_usd": 0}

if __name__ == "__main__":
    # Runs the Uvicorn server when the script is executed
    # host="0.0.0.0" makes it accessible on your network
    # reload=True automatically restarts the server on code changes
    uvicorn.run(app, host="0.0.0.0", port=5000)
