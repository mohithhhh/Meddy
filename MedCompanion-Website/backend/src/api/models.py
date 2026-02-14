"""
Pydantic models for API requests and responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=1000, description="User's message")
    include_history: bool = Field(default=True, description="Include conversation history")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What is Metformin used for?",
                "include_history": True
            }
        }


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="AI assistant's response")
    query_type: str = Field(..., description="Type of query classified")
    guardrail_decision: str = Field(..., description="Guardrail decision made")
    is_refused: bool = Field(..., description="Whether the query was refused")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Metformin is used to control blood sugar levels...",
                "query_type": "medication_info",
                "guardrail_decision": "require_disclaimer",
                "is_refused": False,
                "timestamp": "2024-01-01T12:00:00"
            }
        }


class MedicationInfoRequest(BaseModel):
    """Request model for medication info endpoint"""
    medication_name: str = Field(..., min_length=1, max_length=200)
    
    class Config:
        json_schema_extra = {
            "example": {
                "medication_name": "Metformin"
            }
        }


class HealthCheckResponse(BaseModel):
    """Response model for health check"""
    status: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
