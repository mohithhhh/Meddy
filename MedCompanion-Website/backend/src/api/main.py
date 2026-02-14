"""
FastAPI application for MedCompanion AI Backend
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

from .models import (
    ChatRequest,
    ChatResponse,
    MedicationInfoRequest,
    HealthCheckResponse
)
from ..ai.chat_engine import ChatEngine

# Initialize FastAPI app
app = FastAPI(
    title="MedCompanion AI API",
    description="Guard-railed AI chat system for medication information",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global chat engine instance
chat_engine = None

# Website path
WEBSITE_PATH = Path(__file__).parent.parent.parent.parent


def get_chat_engine() -> ChatEngine:
    """Dependency to get chat engine instance"""
    global chat_engine
    if chat_engine is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY not configured"
            )
        chat_engine = ChatEngine(api_key=api_key)
    return chat_engine


# Mount static files (CSS, JS, images)
if WEBSITE_PATH.exists():
    # Mount CSS directory
    css_path = WEBSITE_PATH / "css"
    if css_path.exists():
        app.mount("/css", StaticFiles(directory=str(css_path)), name="css")
    
    # Mount JS directory
    js_path = WEBSITE_PATH / "js"
    if js_path.exists():
        app.mount("/js", StaticFiles(directory=str(js_path)), name="js")
    
    # Mount images directory if it exists
    images_path = WEBSITE_PATH / "images"
    if images_path.exists():
        app.mount("/images", StaticFiles(directory=str(images_path)), name="images")

@app.get("/")
async def root():
    """Serve the website homepage"""
    website_index = WEBSITE_PATH / "index.html"
    if website_index.exists():
        return FileResponse(str(website_index))
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Detailed health check"""
    return HealthCheckResponse(
        status="healthy",
        version="1.0.0"
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    engine: ChatEngine = Depends(get_chat_engine)
):
    """
    Chat with AI assistant
    
    - **message**: User's question or message
    - **include_history**: Whether to include conversation history
    
    Returns AI response with guardrail information
    """
    try:
        result = engine.chat(
            user_message=request.message,
            include_history=request.include_history
        )
        
        return ChatResponse(
            response=result["response"],
            query_type=result["query_type"],
            guardrail_decision=result["guardrail_decision"],
            is_refused=result["is_refused"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat: {str(e)}"
        )


@app.post("/api/medication-info")
async def get_medication_info(
    request: MedicationInfoRequest,
    engine: ChatEngine = Depends(get_chat_engine)
):
    """
    Get information about a specific medication
    
    - **medication_name**: Name of the medication
    
    Returns structured medication information
    """
    try:
        result = engine.get_medication_info(request.medication_name)
        
        return ChatResponse(
            response=result["response"],
            query_type=result["query_type"],
            guardrail_decision=result["guardrail_decision"],
            is_refused=result["is_refused"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching medication info: {str(e)}"
        )


@app.post("/api/clear-history")
async def clear_history(engine: ChatEngine = Depends(get_chat_engine)):
    """Clear conversation history"""
    engine.clear_history()
    return {"status": "success", "message": "Conversation history cleared"}


@app.get("/api/stats")
async def get_stats(engine: ChatEngine = Depends(get_chat_engine)):
    """Get conversation statistics"""
    return {
        "conversation_length": len(engine.conversation_history),
        "timestamp": datetime.utcnow()
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
