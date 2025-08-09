#!/usr/bin/env python3
"""
Development environment setup script for the Car Price Prediction API.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n📦 {description}")
    print(f"Running: {command}")
    
    result = subprocess.run(command, shell=True)
    
    if result.returncode != 0:
        print(f"❌ Failed: {description}")
        return False
    else:
        print(f"✅ Success: {description}")
        return True

def check_conda():
    """Check if conda is available."""
    result = subprocess.run("conda --version", shell=True, capture_output=True)
    return result.returncode == 0

def setup_with_conda():
    """Set up environment using conda."""
    print("🐍 Setting up with Conda...")
    
    # Check if environment.yml exists
    if os.path.exists("environment.yml"):
        setup_steps = [
            ("conda env create -f environment.yml", "Creating conda environment from environment.yml"),
            ("conda run -n car-price-prediction python src/models/train_model.py", "Training initial model"),
        ]
    else:
        setup_steps = [
            ("conda create -n car-price-prediction python=3.10 -y", "Creating conda environment"),
            ("conda install -n car-price-prediction -c conda-forge scikit-learn pandas numpy matplotlib seaborn -y", "Installing core ML packages"),
            ("conda run -n car-price-prediction pip install -r requirements.txt", "Installing remaining dependencies"),
            ("conda run -n car-price-prediction pip install -r requirements-dev.txt", "Installing development dependencies"),
            ("conda run -n car-price-prediction python src/models/train_model.py", "Training initial model"),
        ]
    
    return setup_steps

def setup_with_pip():
    """Set up environment using pip."""
    print("🐍 Setting up with pip...")
    
    setup_steps = [
        ("python -m pip install --upgrade pip", "Upgrading pip"),
        ("pip install -r requirements.txt", "Installing core dependencies"),
        ("pip install -r requirements-dev.txt", "Installing development dependencies"),
        ("python src/models/train_model.py", "Training initial model"),
        ("pre-commit install", "Setting up pre-commit hooks (optional)"),
    ]
    
    return setup_steps

def main():
    """Set up development environment."""
    print("🚗 Car Price Prediction API - Development Setup")
    print("=" * 60)
    
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    print(f"Setting up development environment in: {os.getcwd()}")
    
    # Check if conda is available
    if check_conda():
        print("\n🐍 Conda detected! Choose setup method:")
        print("1. Use conda (recommended for data science)")
        print("2. Use pip")
        
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == "1":
            setup_steps = setup_with_conda()
        else:
            setup_steps = setup_with_pip()
    else:
        print("\n🐍 Conda not detected, using pip...")
        setup_steps = setup_with_pip()
    
    for command, description in setup_steps:
        if not run_command(command, description):
            if "pre-commit" in command:
                print("⚠️  Pre-commit hooks are optional. Continuing...")
                continue
            else:
                print(f"\n❌ Setup failed at: {description}")
                sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 Development environment setup complete!")
    
    if check_conda() and "conda" in str(setup_steps):
        print("\n🐍 Conda environment created: 'car-price-prediction'")
        print("To activate: conda activate car-price-prediction")
        print("\nNext steps:")
        print("1. Activate environment: conda activate car-price-prediction")
        print("2. Run tests: python scripts/run_tests.py")
        print("3. Start API: python src/api/app.py")
        print("4. Open http://localhost:5000 in your browser")
        print("5. Check API docs at http://localhost:5000/docs")
    else:
        print("\nNext steps:")
        print("1. Run tests: python scripts/run_tests.py")
        print("2. Start API: python src/api/app.py")
        print("3. Open http://localhost:5000 in your browser")
        print("4. Check API docs at http://localhost:5000/docs")

if __name__ == "__main__":
    main()
