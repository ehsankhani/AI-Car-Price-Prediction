"""
Setup configuration for the Car Price Prediction API.
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="car-price-prediction",
    version="1.0.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="A machine learning API for predicting sports car prices",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/car-price-prediction",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=22.0.0",
            "flake8>=4.0.0",
            "mypy>=0.950",
            "pytest-cov>=3.0.0",
        ],
        "docs": [
            "sphinx>=4.0.0",
            "sphinx-rtd-theme>=1.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "car-price-api=api.app:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.json", "*.joblib"],
    },
    project_urls={
        "Bug Reports": "https://github.com/yourusername/car-price-prediction/issues",
        "Source": "https://github.com/yourusername/car-price-prediction",
        "Documentation": "https://github.com/yourusername/car-price-prediction#readme",
    },
)
