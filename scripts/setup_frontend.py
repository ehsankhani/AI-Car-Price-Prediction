#!/usr/bin/env python3
"""
Setup script for the React frontend
"""

import os
import subprocess
import sys
import platform

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            check=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_node():
    """Check if Node.js is installed"""
    success, output = run_command("node --version")
    if success:
        print(f"✅ Node.js found: {output.strip()}")
        return True
    else:
        print("❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/")
        return False

def check_npm():
    """Check if npm is installed"""
    success, output = run_command("npm --version")
    if success:
        print(f"✅ npm found: {output.strip()}")
        return True
    else:
        print("❌ npm not found. Please install npm")
        return False

def install_frontend_dependencies():
    """Install frontend dependencies"""
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    
    if not os.path.exists(frontend_dir):
        print("❌ Frontend directory not found")
        return False
    
    print("📦 Installing frontend dependencies...")
    success, output = run_command("npm install", cwd=frontend_dir)
    
    if success:
        print("✅ Frontend dependencies installed successfully")
        return True
    else:
        print(f"❌ Failed to install dependencies: {output}")
        return False

def main():
    """Main setup function"""
    print("🚗 Setting up AI Car Predictor Frontend")
    print("=" * 50)
    
    # Check prerequisites
    if not check_node():
        return False
    
    if not check_npm():
        return False
    
    # Install dependencies
    if not install_frontend_dependencies():
        return False
    
    print("\n🎉 Frontend setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the backend: python src/car_prediction/main.py")
    print("2. Start the frontend: cd frontend && npm start")
    print("3. Open http://localhost:3000 in your browser")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
