# train_model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import re
import warnings
import os
warnings.filterwarnings('ignore')

def clean_numeric_column(series, column_name):
    """
    Clean numeric columns by handling various non-numeric values
    """
    print(f"Cleaning {column_name}...")
    
    # Convert to string first to handle any object types
    series = series.astype(str)
    
    # Handle different patterns of non-numeric values
    def clean_value(value):
        if pd.isna(value) or value in ['nan', 'NaN', '', ' ']:
            return np.nan
        
        # Remove common non-numeric indicators
        value = str(value).strip()
        
        # Handle special cases
        if value in ['-', 'N/A', 'NA', 'n/a', 'na']:
            return np.nan
        
        # Handle values with '+' (like '1000+', '10,000+')
        if '+' in value:
            # Extract the numeric part before '+'
            value = value.replace('+', '').replace(',', '')
        
        # Handle values with '<' (like '< 1.9')
        if '<' in value:
            value = value.replace('<', '').strip()
        
        # Handle values with '>' (like '> 5.0')
        if '>' in value:
            value = value.replace('>', '').strip()
        
        # Remove commas from numbers (like '1,000')
        value = value.replace(',', '')
        
        # Try to extract numeric value using regex
        numeric_match = re.search(r'[\d,]+\.?\d*', value)
        if numeric_match:
            cleaned_value = numeric_match.group().replace(',', '')
            try:
                return float(cleaned_value)
            except ValueError:
                return np.nan
        
        # If all else fails, try direct conversion
        try:
            return float(value)
        except ValueError:
            print(f"Could not convert '{value}' in {column_name}, setting to NaN")
            return np.nan
    
    cleaned_series = series.apply(clean_value)
    
    # Fill NaN values with median for numeric columns
    if cleaned_series.isna().any():
        median_val = cleaned_series.median()
        print(f"Filling {cleaned_series.isna().sum()} NaN values in {column_name} with median: {median_val}")
        cleaned_series = cleaned_series.fillna(median_val)
    
    return cleaned_series

def clean_price_column(series):
    """
    Clean the price column which may have commas and currency symbols
    """
    print("Cleaning Price column...")
    
    def clean_price(value):
        if pd.isna(value):
            return np.nan
        
        # Convert to string and remove common currency symbols and formatting
        value = str(value).replace('$', '').replace(',', '').strip()
        
        # Handle quotes around prices
        value = value.replace('"', '')
        
        try:
            return float(value)
        except ValueError:
            print(f"Could not convert price '{value}', setting to NaN")
            return np.nan
    
    cleaned_series = series.apply(clean_price)
    
    # Fill NaN values with median
    if cleaned_series.isna().any():
        median_val = cleaned_series.median()
        print(f"Filling {cleaned_series.isna().sum()} NaN values in Price with median: {median_val}")
        cleaned_series = cleaned_series.fillna(median_val)
    
    return cleaned_series

def clean_engine_size_column(series):
    """
    Clean engine size column which may contain 'Electric', mixed values, etc.
    """
    print("Cleaning Engine Size column...")
    
    def clean_engine(value):
        if pd.isna(value) or value in ['nan', 'NaN', '', ' ', '-', 'N/A']:
            return 'Unknown'
        
        value = str(value).strip()
        
        # Standardize electric motor entries
        if 'electric' in value.lower():
            return 'Electric'
        
        # Handle mixed entries like '1.5 + Electric'
        if '+' in value and 'electric' in value.lower():
            return 'Hybrid'
        
        # For pure numeric values, keep as is
        try:
            float_val = float(value)
            return str(float_val)
        except ValueError:
            # For other non-standard values, return as is
            return value
    
    return series.apply(clean_engine)

# 1. Load Data
print("Loading data...")
data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'sport_car_price.csv')
data = pd.read_csv(data_path)
print(f"Loaded {len(data)} rows of data")

# Clean up column names
data.columns = data.columns.str.strip()
print("Column names:", data.columns.tolist())

# 2. Data Cleaning
print("\n=== Data Cleaning Phase ===")

# Clean numeric columns
data['Year'] = clean_numeric_column(data['Year'], 'Year')
data['Horsepower'] = clean_numeric_column(data['Horsepower'], 'Horsepower')
data['Torque (lb-ft)'] = clean_numeric_column(data['Torque (lb-ft)'], 'Torque')
data['0-60 MPH Time (seconds)'] = clean_numeric_column(data['0-60 MPH Time (seconds)'], '0-60 MPH Time')

# Clean price column
data['Price (in USD)'] = clean_price_column(data['Price (in USD)'])

# Clean engine size column (categorical)
data['Engine Size (L)'] = clean_engine_size_column(data['Engine Size (L)'])

# Clean categorical columns
data['Car Make'] = data['Car Make'].fillna('Unknown')
data['Car Model'] = data['Car Model'].fillna('Unknown')

print("\n=== Data Cleaning Complete ===")
print("Data shape after cleaning:", data.shape)
print("\nData types:")
print(data.dtypes)

print("\nSample of cleaned data:")
print(data.head())

# 3. Feature Engineering
print("\n=== Feature Engineering ===")

# Define features (X) and target (y)
features = [
    'Car Make', 'Car Model', 'Year', 'Engine Size (L)',
    'Horsepower', 'Torque (lb-ft)', '0-60 MPH Time (seconds)'
]
target = 'Price (in USD)'

# Check for any remaining missing values
print("\nMissing values per column:")
for col in features + [target]:
    missing_count = data[col].isna().sum()
    print(f"{col}: {missing_count}")

# Remove any rows where target is still NaN
data = data.dropna(subset=[target])
print(f"Data shape after removing NaN targets: {data.shape}")

X = data[features]
y = data[target]

# 4. Preprocessing Pipeline
print("\n=== Setting up Preprocessing Pipeline ===")

# Define categorical and numeric features
categorical_features = ['Car Make', 'Car Model', 'Engine Size (L)']
numeric_features = ['Year', 'Horsepower', 'Torque (lb-ft)', '0-60 MPH Time (seconds)']

print(f"Categorical features: {categorical_features}")
print(f"Numeric features: {numeric_features}")

# Create preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
    ],
    remainder='drop'
)

# 5. Train-Test Split
print("\n=== Splitting Data ===")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"Training set size: {X_train.shape[0]}")
print(f"Test set size: {X_test.shape[0]}")

# 6. Model Training
print("\n=== Training Model ===")

# Create pipeline
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(
        n_estimators=100, 
        random_state=42,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2
    ))
])

# Train the model
print("Training model...")
model.fit(X_train, y_train)
print("Model training complete.")

# 7. Model Evaluation
print("\n=== Model Evaluation ===")

# Make predictions
y_pred_train = model.predict(X_train)
y_pred_test = model.predict(X_test)

# Calculate metrics
train_mae = mean_absolute_error(y_train, y_pred_train)
test_mae = mean_absolute_error(y_test, y_pred_test)
train_r2 = r2_score(y_train, y_pred_train)
test_r2 = r2_score(y_test, y_pred_test)

print(f"Training MAE: ${train_mae:,.2f}")
print(f"Test MAE: ${test_mae:,.2f}")
print(f"Training R²: {train_r2:.4f}")
print(f"Test R²: {test_r2:.4f}")

# Show feature importance
feature_names = (numeric_features + 
                list(model.named_steps['preprocessor']
                    .named_transformers_['cat']
                    .get_feature_names_out(categorical_features)))

importances = model.named_steps['regressor'].feature_importances_
feature_importance = sorted(zip(feature_names, importances), 
                          key=lambda x: x[1], reverse=True)

print("\nTop 10 Most Important Features:")
for i, (feature, importance) in enumerate(feature_importance[:10]):
    print(f"{i+1}. {feature}: {importance:.4f}")

# 8. Save the Model
print("\n=== Saving Model ===")
models_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'models')
os.makedirs(models_dir, exist_ok=True)
model_path = os.path.join(models_dir, 'car_price_model.joblib')
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")

# Save feature information for later use
model_info = {
    'features': features,
    'categorical_features': categorical_features,
    'numeric_features': numeric_features,
    'feature_names': feature_names,
    'model_performance': {
        'train_mae': train_mae,
        'test_mae': test_mae,
        'train_r2': train_r2,
        'test_r2': test_r2
    }
}

model_info_path = os.path.join(models_dir, 'car_price_model_info.joblib')
joblib.dump(model_info, model_info_path)
print(f"Model info saved to {model_info_path}")

print("\n=== Training Complete ===")
print(f"Model is ready to use!")
print(f"Test R² Score: {test_r2:.4f}")
print(f"Test MAE: ${test_mae:,.2f}")