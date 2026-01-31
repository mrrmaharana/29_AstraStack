#!/bin/bash
# Quick Start Guide for Advanced Image & Video Analyzer

echo "======================================"
echo "OSINT Toolkit - Advanced Analyzer"
echo "Quick Start Setup"
echo "======================================"
echo ""

# Check Python installation
echo "Checking Python installation..."
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi
echo "✓ Python found: $(python --version)"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
echo "This may take a few minutes..."
pip install -r requirements.txt --quiet
echo "✓ Dependencies installed"
echo ""

# Create upload directory
echo "Creating upload directory..."
mkdir -p uploads
echo "✓ Upload directory created"
echo ""

# Start Python backend
echo "Starting Python API Backend on port 5000..."
echo "✓ Backend starting..."
echo ""
echo "API Endpoints:"
echo "  - POST /api/analyze-image"
echo "  - POST /api/analyze-video"
echo "  - POST /api/strip-metadata"
echo "  - GET /health"
echo ""
echo "Starting in 3 seconds..."
sleep 3

python api_backend.py
