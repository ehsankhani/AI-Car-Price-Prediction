#!/usr/bin/env python3
"""
Test runner script for the Car Price Prediction API.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and print the result."""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*50}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.stdout:
        print("STDOUT:")
        print(result.stdout)
    
    if result.stderr:
        print("STDERR:")
        print(result.stderr)
    
    if result.returncode != 0:
        print(f"❌ {description} failed with return code {result.returncode}")
        return False
    else:
        print(f"✅ {description} passed")
        return True

def main():
    """Run all tests and checks."""
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    print("🚗 Car Price Prediction API - Test Suite")
    print(f"Working directory: {os.getcwd()}")
    
    tests = [
        ("python -m flake8 src/ --count --select=E9,F63,F7,F82 --show-source --statistics", "Syntax check with flake8"),
        ("python -m flake8 src/ --count --exit-zero --max-complexity=10 --max-line-length=88 --statistics", "Style check with flake8"),
        ("python -m black --check src/", "Format check with black"),
        ("python -m mypy src/ --ignore-missing-imports", "Type check with mypy"),
        ("python -m pytest tests/ -v --cov=src", "Unit tests with pytest"),
        ("python src/models/train_model.py", "Model training test"),
        ("python tests/test_api.py", "API integration test"),
    ]
    
    passed = 0
    failed = 0
    
    for command, description in tests:
        if run_command(command, description):
            passed += 1
        else:
            failed += 1
    
    print(f"\n{'='*50}")
    print(f"Test Summary")
    print(f"{'='*50}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Total: {passed + failed}")
    
    if failed > 0:
        print("\n❌ Some tests failed. Please fix the issues before deploying.")
        sys.exit(1)
    else:
        print("\n🎉 All tests passed! Ready for deployment.")
        sys.exit(0)

if __name__ == "__main__":
    main()
