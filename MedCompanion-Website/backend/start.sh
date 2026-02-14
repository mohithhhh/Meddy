#!/bin/bash

# MedCompanion AI Backend Startup Script

echo "🚀 Starting MedCompanion AI Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please add your GEMINI_API_KEY before starting."
    echo ""
    echo "Edit .env and add:"
    echo "GEMINI_API_KEY=your_api_key_here"
    echo ""
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=.*[^_]" .env; then
    echo "⚠️  GEMINI_API_KEY not set in .env file"
    echo ""
    echo "Please edit .env and add your Gemini API key:"
    echo "GEMINI_API_KEY=your_actual_api_key_here"
    echo ""
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    exit 1
fi

echo "✅ Environment configured"
echo "✅ Starting server..."
echo ""
echo "Server will be available at:"
echo "  - API: http://localhost:8000"
echo "  - Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
