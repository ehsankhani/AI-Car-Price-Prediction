# Deployment Guide

This guide covers different deployment options for the Car Price Prediction API.

## Local Development

### Prerequisites
- Python 3.8+ (3.10 recommended)
- Git
- pip OR Anaconda/Miniconda

### Setup

#### Option 1: Using Python venv
```bash
# Clone repository
git clone https://github.com/yourusername/car-price-prediction.git
cd car-price-prediction

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train model (if not already trained)
python src/models/train_model.py

# Run development server
python src/api/app.py
```

#### Option 2: Using Conda
```bash
# Clone repository
git clone https://github.com/yourusername/car-price-prediction.git
cd car-price-prediction

# Create environment from file (recommended)
conda env create -f environment.yml
conda activate car-price-prediction

# OR create manually
# conda create -n car-price-prediction python=3.10
# conda activate car-price-prediction
# conda install -c conda-forge scikit-learn pandas numpy matplotlib seaborn
# pip install -r requirements.txt

# Train model (if not already trained)
python src/models/train_model.py

# Run development server
python src/api/app.py
```

#### Option 3: Automated Setup
```bash
# Clone repository
git clone https://github.com/yourusername/car-price-prediction.git
cd car-price-prediction

# Run setup script (detects conda/pip automatically)
python scripts/setup_dev.py
```

## Docker Deployment

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["python", "src/api/app.py"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  car-price-api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - HOST=0.0.0.0
      - PORT=5000
    volumes:
      - ./models:/app/models:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - car-price-api
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t car-price-prediction .

# Run container
docker run -d -p 5000:5000 --name car-price-api car-price-prediction

# Or use docker-compose
docker-compose up -d
```

## Production Deployment

### Using Gunicorn

Install Gunicorn:
```bash
pip install gunicorn
```

Run with Gunicorn:
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:5000 \
  --timeout 120 \
  --keep-alive 2 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  src.api.main_api:app
```

### Environment Variables

Create a `.env` file:
```bash
# Application settings
HOST=0.0.0.0
PORT=5000
RELOAD=false
LOG_LEVEL=info

# Model settings
MODEL_PATH=models/car_price_model.joblib
MODEL_INFO_PATH=models/car_price_model_info.joblib

# Security (for production)
SECRET_KEY=your-secret-key-here
API_KEY_ENABLED=false
CORS_ORIGINS=["*"]
```

## Cloud Deployment

### AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize EB application:
```bash
eb init car-price-prediction
```

3. Create environment:
```bash
eb create production
```

4. Deploy:
```bash
eb deploy
```

### Google Cloud Run

1. Build and push image:
```bash
# Build for Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/car-price-prediction

# Deploy
gcloud run deploy car-price-prediction \
  --image gcr.io/PROJECT_ID/car-price-prediction \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --port 5000
```

### Azure Container Instances

```bash
# Create resource group
az group create --name car-price-rg --location eastus

# Create container instance
az container create \
  --resource-group car-price-rg \
  --name car-price-api \
  --image your-registry/car-price-prediction:latest \
  --cpu 1 \
  --memory 2 \
  --ports 5000 \
  --environment-variables HOST=0.0.0.0 PORT=5000
```

### Heroku

1. Create `Procfile`:
```
web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT src.api.main_api:app
```

2. Create `runtime.txt`:
```
python-3.11.0
```

3. Deploy:
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set HOST=0.0.0.0
heroku config:set PORT=5000

# Deploy
git push heroku main
```

## Kubernetes Deployment

### Deployment YAML

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: car-price-api
  labels:
    app: car-price-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: car-price-api
  template:
    metadata:
      labels:
        app: car-price-api
    spec:
      containers:
      - name: api
        image: your-registry/car-price-prediction:latest
        ports:
        - containerPort: 5000
        env:
        - name: HOST
          value: "0.0.0.0"
        - name: PORT
          value: "5000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: car-price-service
spec:
  selector:
    app: car-price-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml
```

## Monitoring and Logging

### Prometheus Metrics

Add to `requirements.txt`:
```
prometheus-client>=0.14.0
```

Update main_api.py:
```python
from prometheus_client import Counter, Histogram, generate_latest

# Metrics
REQUESTS_TOTAL = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUESTS_TOTAL.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_DURATION.observe(duration)
    
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Logging Configuration

```python
import logging
from pythonjsonlogger import jsonlogger

# Configure structured logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
```

## Security Considerations

### HTTPS

Use a reverse proxy (nginx) with SSL:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Rate Limiting

Add to `main_api.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/predict")
@limiter.limit("10/minute")
async def predict_price(request: Request, features: CarFeatures):
    # ... existing code
```

### API Authentication

```python
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != "your-api-key":
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials

@app.post("/predict")
async def predict_price(features: CarFeatures, token: str = Depends(verify_token)):
    # ... existing code
```

## Performance Optimization

### Model Optimization

1. **Model Compression**: Use quantization or pruning
2. **Caching**: Cache predictions for identical inputs
3. **Batch Processing**: Support batch predictions

### Application Optimization

```python
# Add response compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add caching
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_prediction(features_hash: str):
    # Cache based on input hash
    pass
```

## Backup and Recovery

### Model Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "models_backup_$DATE.tar.gz" models/
aws s3 cp "models_backup_$DATE.tar.gz" s3://your-backup-bucket/
```

### Database Backup (if using database)

```bash
# For PostgreSQL
pg_dump -h localhost -U username -d database_name > backup.sql

# For MongoDB
mongodump --host localhost --port 27017 --db database_name --out backup/
```

## Troubleshooting

### Common Issues

1. **Model Loading Errors**
   - Check model file paths
   - Verify scikit-learn version compatibility

2. **Memory Issues**
   - Increase container memory limits
   - Optimize model size

3. **Performance Issues**
   - Check CPU/memory usage
   - Enable response compression
   - Implement caching

### Health Checks

```bash
# API health
curl -f http://localhost:5000/health

# Model prediction test
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"car_make":"Tesla","car_model":"Model S","year":2022,"engine_size":0,"horsepower":1020,"torque":1050,"zero_to_sixty_time":2.1}'
```
