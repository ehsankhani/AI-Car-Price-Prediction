# API Documentation

This document provides detailed information about the Car Price Prediction API endpoints.

## Base URL

```
http://localhost:5000
```

## Authentication

This API currently does not require authentication. For production use, consider implementing API keys or OAuth.

## Endpoints

### Health Check

Check if the API is running and the model is loaded.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "message": "Car Price Prediction API is running!"
}
```

**Status Codes:**
- `200`: API is healthy
- `500`: Server error

### Predict Car Price

Predict the price of a sports car based on its specifications.

**Endpoint:** `POST /predict`

**Request Body:**
```json
{
  "car_make": "string",
  "car_model": "string", 
  "year": "integer",
  "engine_size": "number",
  "horsepower": "integer",
  "torque": "integer", 
  "zero_to_sixty_time": "number"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| car_make | string | Yes | Manufacturer (e.g., "Porsche", "Ferrari") |
| car_model | string | Yes | Model name (e.g., "911", "488 GTB") |
| year | integer | Yes | Manufacturing year (2015-2024) |
| engine_size | number | Yes | Engine displacement in liters (0 for electric) |
| horsepower | integer | Yes | Engine power output |
| torque | integer | Yes | Engine torque in lb-ft |
| zero_to_sixty_time | number | Yes | 0-60 MPH acceleration time in seconds |

**Example Request:**
```json
{
  "car_make": "Porsche",
  "car_model": "911",
  "year": 2022,
  "engine_size": 3.0,
  "horsepower": 379,
  "torque": 331,
  "zero_to_sixty_time": 4.0
}
```

**Success Response:**
```json
{
  "predicted_price_usd": 125000.50
}
```

**Error Response:**
```json
{
  "error": "Prediction failed: Invalid input data",
  "predicted_price_usd": 0
}
```

**Status Codes:**
- `200`: Successful prediction
- `422`: Validation error (invalid input format)
- `500`: Internal server error

## Interactive Documentation

The API provides interactive documentation at:

- **Swagger UI:** `/docs`
- **ReDoc:** `/redoc`

## Example Usage

### cURL

```bash
# Health check
curl -X GET http://localhost:5000/health

# Predict price
curl -X POST "http://localhost:5000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "car_make": "Ferrari",
       "car_model": "488 GTB",
       "year": 2022,
       "engine_size": 3.9,
       "horsepower": 661,
       "torque": 561,
       "zero_to_sixty_time": 3.0
     }'
```

### Python

```python
import requests

# API base URL
base_url = "http://localhost:5000"

# Health check
health_response = requests.get(f"{base_url}/health")
print(health_response.json())

# Predict price
prediction_data = {
    "car_make": "Lamborghini",
    "car_model": "Huracan",
    "year": 2021,
    "engine_size": 5.2,
    "horsepower": 630,
    "torque": 443,
    "zero_to_sixty_time": 3.2
}

response = requests.post(f"{base_url}/predict", json=prediction_data)
result = response.json()

if response.status_code == 200 and "error" not in result:
    print(f"Predicted price: ${result['predicted_price_usd']:,.2f}")
else:
    print(f"Error: {result.get('error', 'Unknown error')}")
```

### JavaScript

```javascript
// Health check
fetch('http://localhost:5000/health')
  .then(response => response.json())
  .then(data => console.log(data));

// Predict price
const predictionData = {
  car_make: "McLaren",
  car_model: "720S", 
  year: 2021,
  engine_size: 4.0,
  horsepower: 710,
  torque: 568,
  zero_to_sixty_time: 2.9
};

fetch('http://localhost:5000/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(predictionData)
})
.then(response => response.json())
.then(data => {
  if (data.error) {
    console.error('Error:', data.error);
  } else {
    console.log(`Predicted price: $${data.predicted_price_usd.toLocaleString()}`);
  }
});
```

## Supported Car Makes

The model supports predictions for the following manufacturers:

- Porsche
- Lamborghini  
- Ferrari
- Audi
- McLaren
- BMW
- Mercedes-Benz
- Chevrolet
- Ford
- Nissan
- Aston Martin
- Bugatti
- Dodge
- Jaguar
- Koenigsegg
- Lexus
- Lotus
- Maserati
- Tesla
- Rimac

## Data Validation

The API performs the following validations:

1. **Required fields:** All parameters must be provided
2. **Data types:** Parameters must match expected types
3. **Value ranges:**
   - Year: 2015-2024
   - Engine size: 0-8.0L (0 for electric vehicles)
   - Horsepower: 100-2000
   - Torque: 100-2000 lb-ft
   - 0-60 time: 1.0-10.0 seconds

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request:** Invalid request format
- **422 Unprocessable Entity:** Validation errors
- **500 Internal Server Error:** Server or model errors

Error responses include descriptive messages to help identify the issue.

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing rate limiting to prevent abuse.

## CORS

Cross-Origin Resource Sharing (CORS) is not explicitly configured. Add CORS middleware for frontend applications running on different domains.

## Performance

- Average response time: <100ms
- Model loading time: ~2-3 seconds on startup
- Memory usage: ~200MB with loaded model

## Deployment Considerations

For production deployment:

1. Use a production ASGI server (e.g., Gunicorn with Uvicorn workers)
2. Implement proper logging and monitoring
3. Add authentication and authorization
4. Set up rate limiting
5. Configure HTTPS
6. Use environment variables for configuration
7. Implement health checks and metrics endpoints
