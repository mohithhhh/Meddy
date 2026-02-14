"""
MedCompanion AI Chat Engine

Main AI chat system powered by Google Gemini with safety guardrails
"""

import os
from typing import List, Dict, Optional
from google import genai
from google.genai import types
from .guardrails import AIGuardrails, GuardrailResponse, QueryType


class ChatEngine:
    """
    AI chat engine with medical guardrails
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize chat engine
        
        Args:
            api_key: Google Gemini API key (or set GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY must be provided or set as environment variable")
        
        self.client = genai.Client(api_key=self.api_key)
        self.guardrails = AIGuardrails()
        self.conversation_history: List[Dict[str, str]] = []
    
    def get_system_prompt(self) -> str:
        """
        Get the system prompt that defines AI behavior
        
        Returns:
            System prompt string
        """
        return """You are MedCompanion AI, a helpful medication information assistant.

**YOUR ROLE:**
- Provide general, factual information about medications
- Explain how medications work in simple terms
- List common side effects from official sources
- Explain general usage instructions

**STRICT RULES - YOU MUST NEVER:**
❌ Recommend specific dosages
❌ Diagnose medical conditions
❌ Suggest treatment plans
❌ Tell users to start/stop medications
❌ Provide personalized medical advice
❌ Make decisions that should be made by doctors

**ALWAYS:**
✅ Refer users to their doctor/pharmacist for medical decisions
✅ Provide general, educational information only
✅ Include disclaimers
✅ Be helpful but stay within safe boundaries

**RESPONSE STYLE:**
- Clear and concise
- Easy to understand (avoid medical jargon when possible)
- Empathetic and supportive
- Always include appropriate disclaimers

Remember: You are an information tool, not a replacement for medical professionals."""
    
    def chat(self, user_message: str, include_history: bool = True) -> Dict[str, any]:
        """
        Process a chat message with guardrails
        
        Args:
            user_message: User's question/message
            include_history: Whether to include conversation history
            
        Returns:
            Dict with response, query_type, and guardrail_decision
        """
        # Check guardrails first
        guardrail_response, guardrail_message = self.guardrails.check_guardrails(user_message)
        query_type = self.guardrails.classify_query(user_message)
        
        # If query is refused, return refusal message
        if guardrail_response in [GuardrailResponse.REFUSE_MEDICAL_ADVICE, GuardrailResponse.REFUSE_HARMFUL]:
            refusal = self.guardrails.get_refusal_message(query_type)
            return {
                "response": refusal,
                "query_type": query_type.value,
                "guardrail_decision": guardrail_response.value,
                "is_refused": True
            }
        
        # Build conversation context
        conversation_context = self.get_system_prompt() + "\n\n"
        
        if include_history and self.conversation_history:
            conversation_context += "**Previous conversation:**\n"
            for msg in self.conversation_history[-6:]:  # Last 3 exchanges
                conversation_context += f"User: {msg['user']}\nAssistant: {msg['assistant']}\n\n"
        
        conversation_context += f"**Current question:**\nUser: {user_message}\n\nAssistant:"
        
        try:
            # Generate AI response using new API
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=conversation_context
            )
            ai_response = response.text
            
            # Add disclaimer
            ai_response_with_disclaimer = self.guardrails.add_disclaimer(ai_response, query_type)
            
            # Store in conversation history
            self.conversation_history.append({
                "user": user_message,
                "assistant": ai_response_with_disclaimer
            })
            
            return {
                "response": ai_response_with_disclaimer,
                "query_type": query_type.value,
                "guardrail_decision": guardrail_response.value,
                "is_refused": False
            }
            
        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error. Please try again. If the problem persists, contact support.",
                "query_type": query_type.value,
                "guardrail_decision": "error",
                "is_refused": False,
                "error": str(e)
            }
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_medication_info(self, medication_name: str) -> Dict[str, any]:
        """
        Get structured information about a specific medication
        
        Args:
            medication_name: Name of the medication
            
        Returns:
            Dict with medication information
        """
        query = f"Provide a brief overview of {medication_name}: what it is, what it's used for, and common side effects."
        return self.chat(query, include_history=False)


# Example usage
if __name__ == "__main__":
    # Note: Set GEMINI_API_KEY environment variable before running
    import sys
    
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️  Please set GEMINI_API_KEY environment variable")
        print("Example: export GEMINI_API_KEY='your-api-key-here'")
        sys.exit(1)
    
    print("🤖 MedCompanion AI Chat Engine\n")
    print("=" * 80)
    
    chat = ChatEngine()
    
    # Test queries
    test_queries = [
        "What is Metformin used for?",
        "What are the side effects of Lisinopril?",
        "Should I take 500mg or 1000mg?",  # Will be refused
        "Tell me about aspirin",
    ]
    
    for query in test_queries:
        print(f"\n👤 User: {query}")
        print("-" * 80)
        
        result = chat.chat(query)
        
        print(f"🤖 Assistant: {result['response']}")
        print(f"\n📊 Query Type: {result['query_type']}")
        print(f"🛡️  Guardrail Decision: {result['guardrail_decision']}")
        print(f"🚫 Refused: {result['is_refused']}")
        print("=" * 80)
