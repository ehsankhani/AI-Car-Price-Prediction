# 🚗 Car Price Prediction API

A machine learning-powered API for predicting sports car prices using FastAPI and scikit-learn. This project provides both a web interface and REST API endpoints for accurate car price predictions based on various vehicle specifications.

## 📸 Preview

![Car Price Prediction Demo](assets/question.jpg)

## 🌟 Features

- **Machine Learning Model**: Random Forest Regressor trained on sports car data
- **FastAPI Backend**: High-performance, modern Python web framework
- **Modern React Frontend**: 3D animations, glass morphism design, and smooth interactions
- **3D Visualizations**: Interactive 3D car models using Three.js and React Three Fiber
- **Advanced Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
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
├── frontend/                    # Modern React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── App.tsx            # Main app component
│   │   └── index.tsx          # Entry point
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── README.md              # Frontend documentation
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

#### Option 1: Backend Only (Simple HTML Interface)
1. **Run the backend**
   ```bash
   python src/car_prediction/main.py
   ```

2. **Access the application**
   - Web Interface: http://localhost:5000
   - API Documentation: http://localhost:5000/docs
   - Alternative Docs: http://localhost:5000/redoc

#### Option 2: Modern React Frontend (Recommended)
1. **Start the backend**
   ```bash
   python src/car_prediction/main.py
   ```

2. **Start the React frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Access the modern interface**
   - Modern React UI: http://localhost:3000
   - Features: 3D animations, glass morphism design, smooth interactions

#### Option 3: Docker Deployment (Production Ready)
1. **Build and run with Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up --build
   
   # Or run in background
   docker-compose up -d --build
   ```

2. **Access the applications**
   - Backend API: http://localhost:5000
   - Frontend UI: http://localhost:3000
   - API Documentation: http://localhost:5000/docs

3. **Stop the services**
   ```bash
   docker-compose down
   ```

#### Option 4: Individual Docker Containers
1. **Backend only**
   ```bash
   # Build the backend image
   docker build -t car-pred-backend .
   
   # Run the backend
   docker run -p 5000:5000 car-pred-backend
   ```

2. **Frontend only** (requires backend running)
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Build the frontend image
   docker build -t car-pred-frontend .
   
   # Run the frontend
   docker run -p 3000:3000 car-pred-frontend
   ```

## 🐳 Docker Deployment Guide

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available for Docker

### Quick Start with Docker
```bash
# Clone the repository
git clone <repository-url>
cd car-price-prediction

# Build and start all services
docker-compose up --build

# Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/docs
```

### Docker Services Overview

| Service | Port | Description |
|---------|------|-------------|
| `car-price-api` | 5000 | FastAPI backend with ML model |
| `car-price-frontend` | 3000 | React frontend with 3D animations |
| `nginx` | 80 | Reverse proxy (optional) |
| `prometheus` | 9090 | Metrics collection (optional) |
| `grafana` | 3000 | Monitoring dashboard (optional) |

### Advanced Docker Commands

#### Build specific services
```bash
# Build only backend
docker-compose build car-price-api

# Build only frontend
docker-compose build car-price-frontend
```

#### Run in production mode
```bash
# Run with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### View logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs car-price-api
docker-compose logs car-price-frontend

# Follow logs in real-time
docker-compose logs -f car-price-api
```

#### Scale services
```bash
# Scale backend instances
docker-compose up --scale car-price-api=3
```

### Docker Troubleshooting

#### Common Issues

1. **Port conflicts**
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :5000
   netstat -tulpn | grep :3000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Memory issues**
   ```bash
   # Check Docker memory usage
   docker stats
   
   # Increase Docker memory limit in Docker Desktop settings
   ```

3. **Build failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Model loading errors**
   ```bash
   # Ensure model files exist
   ls -la models/
   
   # Retrain model if needed
   docker-compose exec car-price-api python src/car_prediction/models/train_model.py
   ```

#### Health Checks
```bash
# Check service health
docker-compose ps

# Test API health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000
```

#### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# View detailed container info
docker inspect car-price-api
docker inspect car-price-frontend
```

### Production Deployment

#### Environment Variables
Create a `.env` file:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
API_RELOAD=false

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000

# Database (if using)
DATABASE_URL=postgresql://user:password@db:5432/carprediction
```

#### Security Considerations
```bash
# Run with non-root user
docker-compose exec car-price-api whoami

# Check container security
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image car-pred-backend
```

#### Backup and Restore
```bash
# Backup model files
docker cp car-price-api:/app/models ./backup/models

# Restore model files
docker cp ./backup/models car-price-api:/app/models
```

### Deployment Options

#### 1. Local Development
```bash
# Quick start for development
docker-compose up --build
```

#### 2. Production with Monitoring
```bash
# Production deployment with monitoring
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### 3. Cloud Deployment
```bash
# Deploy to cloud platforms
# AWS ECS, Google Cloud Run, Azure Container Instances
# Use the provided Dockerfiles for containerization
```

#### 4. Kubernetes Deployment
```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: car-prediction-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: car-prediction-api
  template:
    metadata:
      labels:
        app: car-prediction-api
    spec:
      containers:
      - name: api
        image: car-pred-backend:latest
        ports:
        - containerPort: 5000
```

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
