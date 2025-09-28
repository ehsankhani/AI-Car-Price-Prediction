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
├── src/
│   └── car_prediction/
│       ├── __init__.py
│       ├── main.py
│       └── models/
│           ├── __init__.py
│           └── train_model.py
├── data/
│   ├── sport_car_price.csv
│   └── car_price.ipynb
├── models/
│   ├── car_price_model.joblib
│   ├── car_price_model_info.joblib
│   └── car_price_model_manual_columns.json
├── tests/
│   └── test_main.py
├── docs/
├── scripts/
├── assets/
├── pyproject.toml
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Installation

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
   pip install ".[dev]"
   ```

### Running the Application

1. **Run the application**
   ```bash
   python src/car_prediction/main.py
   ```

2. **Access the application**
   - Web Interface: http://localhost:5000
   - API Documentation: http://localhost:5000/docs
   - Alternative Docs: http://localhost:5000/redoc

## 🤖 Machine Learning Model

### Training the Model

To retrain the model with new data:

```bash
python src/car_prediction/models/train_model.py
```

## 🧪 Testing

Run the test suite:

```bash
pytest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Format code
black src/ tests/

# Run linting
flake8 src/ tests/

# Run type checking
mypy src/
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
