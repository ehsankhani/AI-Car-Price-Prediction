#!/usr/bin/env python3
"""
Test script for the Car Price Prediction API
"""

import requests
import json
import time

# Test data - Porsche 911 example
test_data = {
    "car_make": "Porsche",
    "car_model": "911",
    "year": 2022,
    "engine_size": 3.0,
    "horsepower": 379,
    "torque": 331,
    "zero_to_sixty_time": 4.0
}

# Tesla example (Electric)
test_data_electric = {
    "car_make": "Tesla",
    "car_model": "Model S Plaid",
    "year": 2022,
    "engine_size": 0,  # Electric
    "horsepower": 1020,
    "torque": 1050,
    "zero_to_sixty_time": 1.98
}

def test_api():
    print("🚗 Testing Car Price Prediction API")
    print("=" * 50)
    
    # Test health endpoint
    try:
        print("Testing health endpoint...")
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ Health check passed:", response.json())
        else:
            print("❌ Health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running on port 5000")
        return
    
    print()
    
    # Test prediction endpoint with Porsche
    print("Testing prediction with Porsche 911...")
    try:
        response = requests.post(
            "http://localhost:5000/predict",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            result = response.json()
            if "error" in result:
                print(f"❌ Prediction error: {result['error']}")
            else:
                price = result.get('predicted_price_usd', 0)
                print(f"✅ Predicted price: ${price:,.2f}")
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Exception during prediction: {e}")
    
    print()
    
    # Test prediction endpoint with Tesla (Electric)
    print("Testing prediction with Tesla Model S Plaid (Electric)...")
    try:
        response = requests.post(
            "http://localhost:5000/predict",
            headers={"Content-Type": "application/json"},
            json=test_data_electric
        )
        
        if response.status_code == 200:
            result = response.json()
            if "error" in result:
                print(f"❌ Prediction error: {result['error']}")
            else:
                price = result.get('predicted_price_usd', 0)
                print(f"✅ Predicted price: ${price:,.2f}")
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Exception during prediction: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Test completed! You can now:")
    print("1. Open http://localhost:5000 for the web interface")
    print("2. Open http://localhost:5000/docs for API documentation")
    print("3. Use the API programmatically as shown above")

if __name__ == "__main__":
    test_api()
