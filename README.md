# 🚗 Car Price Prediction API

A machine learning-powered API for predicting sports car prices using FastAPI and scikit-learn. This project provides both a web interface and REST API endpoints for accurate car price predictions based on various vehicle specifications.

## 📸 Preview

![Car Price Prediction Demo](assets/question.jpg)

## 🌟 Features

- **Machine Learning Model**: Random Forest Regressor trained on sports car data
- **FastAPI Backend**: High-performance, modern Python web framework
- **Interactive Web UI**: Beautiful, responsive interface for easy predictions
- **REST API**: Programmatic access with comprehensive documentation
- **Data Preprocessing**: Robust handling of various data formats and edge cases
- **Model Persistence**: Trained models saved with joblib for quick loading
- **Comprehensive Testing**: Test suite for API endpoints and model validation

## 🏗️ Project Structure

```
car-price-prediction/
├── src/                    # Source code
│   ├── api/               # FastAPI application
│   │   ├── main_api.py    # Main API endpoints and web interface
│   │   └── app.py         # Application runner
│   ├── models/            # ML model training
│   │   └── train_model.py # Model training script
│   └── utils/             # Utility functions
├── data/                  # Dataset and notebooks
│   ├── sport_car_price.csv # Training dataset
│   └── car_price.ipynb   # Data exploration notebook
├── models/                # Trained models
│   ├── car_price_model.joblib
│   ├── car_price_model_info.joblib
│   └── car_price_model_manual_columns.json
├── tests/                 # Test files
│   └── test_api.py       # API tests
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── assets/                # Static assets
│   ├── question.jpg
│   └── car_prediction.zip
├── requirements.txt       # Python dependencies (pip)
├── requirements-dev.txt   # Development dependencies (pip)
├── environment.yml        # Conda environment file
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher (3.10 is recommended)
- pip package manager OR Anaconda/Miniconda

### Installation

#### Option 1: Using Python venv

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/car-price-prediction.git
   cd car-price-prediction
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

#### Option 2: Using Conda

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/car-price-prediction.git
   cd car-price-prediction
   ```

2. **Create conda environment**
   
   **Method A: Using environment.yml (Recommended)**
   ```bash
   # Create environment from file
   conda env create -f environment.yml
   
   # Activate environment
   conda activate car-price-prediction
   ```
   
   **Method B: Manual setup**
   ```bash
   # Create environment with Python 3.10
   conda create -n car-price-prediction python=3.10
   
   # Activate environment
   conda activate car-price-prediction
   
   # Install core dependencies via conda (recommended for scientific packages)
   conda install -c conda-forge scikit-learn pandas numpy matplotlib seaborn
   
   # Install remaining dependencies via pip
   pip install -r requirements.txt
   ```

#### Option 3: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/car-price-prediction.git
   cd car-price-prediction
   ```

2. **Run automated setup**
   ```bash
   # Detects conda/pip automatically and sets up environment
   python scripts/setup_dev.py
   ```

### Running the Application

After completing any installation option:

1. **Activate environment (if using conda)**
   ```bash
   conda activate car-price-prediction
   ```

2. **Run the application**
   ```bash
   python src/api/app.py
   ```

3. **Access the application**
   - Web Interface: http://localhost:5000
   - API Documentation: http://localhost:5000/docs
   - Alternative Docs: http://localhost:5000/redoc

## 📊 Dataset

The model is trained on sports car data including:

- **Car Make**: Manufacturer (Porsche, Ferrari, Lamborghini, etc.)
- **Car Model**: Specific model name
- **Year**: Manufacturing year (2015-2024)
- **Engine Size**: Displacement in liters (or "Electric" for EVs)
- **Horsepower**: Engine power output
- **Torque**: Engine torque in lb-ft
- **0-60 MPH Time**: Acceleration time in seconds
- **Price**: Target variable in USD

## 🤖 Machine Learning Model

### Model Details
- **Algorithm**: Random Forest Regressor
- **Features**: 7 input features (make, model, year, engine size, horsepower, torque, acceleration)
- **Preprocessing**: StandardScaler for numeric features, OneHotEncoder for categorical features
- **Performance**: R² score and MAE metrics available in model info

### Training the Model

To retrain the model with new data:

```bash
python src/models/train_model.py
```

This will:
1. Load and clean the dataset
2. Perform feature engineering
3. Train the Random Forest model
4. Evaluate performance
5. Save the trained model and metadata

## 🌐 API Usage

### Health Check
```bash
curl http://localhost:5000/health
```

### Predict Car Price
```bash
curl -X POST "http://localhost:5000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "car_make": "Porsche",
       "car_model": "911",
       "year": 2022,
       "engine_size": 3.0,
       "horsepower": 379,
       "torque": 331,
       "zero_to_sixty_time": 4.0
     }'
```

### Python Example
```python
import requests

# Prediction data
data = {
    "car_make": "Ferrari",
    "car_model": "488 GTB",
    "year": 2022,
    "engine_size": 3.9,
    "horsepower": 661,
    "torque": 561,
    "zero_to_sixty_time": 3.0
}

# Make prediction
response = requests.post("http://localhost:5000/predict", json=data)
result = response.json()
print(f"Predicted price: ${result['predicted_price_usd']:,.2f}")
```

## 🧪 Testing

Run the test suite:

```bash
# Run API tests
python tests/test_api.py

# Or using pytest (install first: pip install pytest)
pytest tests/
```

## 📱 Web Interface

The web interface provides:
- **Interactive Form**: Easy input of car specifications
- **Real-time Predictions**: Instant price estimates
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Clear feedback for invalid inputs
- **API Links**: Direct access to documentation

## 🔧 Configuration

### Environment Variables
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 5000)
- `RELOAD`: Auto-reload on changes (default: True)

### Model Configuration
Model parameters can be adjusted in `src/models/train_model.py`:
- `n_estimators`: Number of trees in the forest
- `max_depth`: Maximum depth of trees
- `min_samples_split`: Minimum samples to split a node
- `random_state`: Random seed for reproducibility

## 📈 Performance Metrics

The model provides several performance indicators:
- **R² Score**: Coefficient of determination
- **MAE**: Mean Absolute Error in USD
- **Feature Importance**: Ranking of input feature significance

Check model performance:
```python
import joblib
model_info = joblib.load('models/car_price_model_info.joblib')
print(model_info['model_performance'])
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

#### Using venv
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run linting
flake8 src/

# Run type checking
mypy src/

# Format code
black src/
```

#### Using conda
```bash
# Install development dependencies via conda (when available)
conda install -c conda-forge pytest black flake8 mypy jupyter

# Install remaining dev dependencies via pip
pip install -r requirements-dev.txt

# Run linting
flake8 src/

# Run type checking
mypy src/

# Format code
black src/
```

## 📋 TODO

- [ ] Add more car manufacturers and models
- [ ] Implement model versioning and A/B testing
- [ ] Add data validation and input sanitization
- [ ] Create Docker containerization
- [ ] Add logging and monitoring
- [ ] Implement rate limiting
- [ ] Add batch prediction endpoints
- [ ] Create model explanation features (SHAP values)

## 🐛 Troubleshooting

### Common Issues

1. **Model file not found**
   - Ensure you've run the training script first
   - Check that model files are in the `models/` directory

2. **API connection errors**
   - Verify the server is running on the correct port
   - Check firewall settings

3. **Prediction errors**
   - Validate input data format and ranges
   - Ensure all required fields are provided

### Debugging

Enable debug mode by setting `reload=True` in `src/api/app.py` for detailed error messages.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Sports car data sourced from various automotive databases
- FastAPI for the excellent web framework
- scikit-learn for machine learning capabilities
- The open-source community for inspiration and tools

## 📞 Support

For support, email your-email@example.com or create an issue on GitHub.

---

**⭐ If you found this project helpful, please give it a star!**
