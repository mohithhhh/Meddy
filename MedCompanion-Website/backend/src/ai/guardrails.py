"""
MedCompanion AI Guardrails System

This module implements safety guardrails for the AI chat system to ensure:
1. No medical advice is given
2. Harmful queries are detected and refused
3. All responses include appropriate disclaimers
4. Compliance with medical regulations
"""

from typing import Dict, List, Tuple
from enum import Enum


class QueryType(Enum):
    """Types of user queries"""
    MEDICATION_INFO = "medication_info"  # General info about a medication
    SIDE_EFFECTS = "side_effects"        # Side effects inquiry
    DOSAGE = "dosage"                    # Dosage question (REFUSE)
    DIAGNOSIS = "diagnosis"              # Diagnosis question (REFUSE)
    TREATMENT = "treatment"              # Treatment advice (REFUSE)
    INTERACTION = "interaction"          # Drug interactions
    GENERAL = "general"                  # General health question
    HARMFUL = "harmful"                  # Potentially harmful query


class GuardrailResponse(Enum):
    """Guardrail decision outcomes"""
    ALLOW = "allow"                      # Safe to answer
    REFUSE_MEDICAL_ADVICE = "refuse_medical_advice"
    REFUSE_HARMFUL = "refuse_harmful"
    REQUIRE_DISCLAIMER = "require_disclaimer"


class AIGuardrails:
    """
    Guardrails system to ensure safe and compliant AI responses
    """
    
    # Keywords that indicate medical advice requests (REFUSE)
    MEDICAL_ADVICE_KEYWORDS = [
        "should i take", "can i take", "how much should i",
        "what should i do", "diagnose", "treat my", "cure",
        "prescribe", "recommend dosage", "stop taking",
        "increase dose", "decrease dose", "substitute",
        "500mg or 1000mg", "mg or", "can i stop"
    ]
    
    # Keywords that indicate harmful intent (REFUSE)
    HARMFUL_KEYWORDS = [
        "overdose", "get high", "abuse", "recreational",
        "suicide", "self-harm", "kill myself"
    ]
    
    # Safe query patterns (ALLOW with disclaimer)
    SAFE_PATTERNS = [
        "what is", "tell me about", "information about",
        "side effects of", "used for", "how does", "what are"
    ]
    
    @staticmethod
    def classify_query(query: str) -> QueryType:
        """
        Classify the type of user query
        
        Args:
            query: User's question
            
        Returns:
            QueryType enum value
        """
        query_lower = query.lower()
        
        # Check for harmful queries first
        if any(keyword in query_lower for keyword in AIGuardrails.HARMFUL_KEYWORDS):
            return QueryType.HARMFUL
        
        # Check for medical advice requests
        if any(keyword in query_lower for keyword in AIGuardrails.MEDICAL_ADVICE_KEYWORDS):
            if "dosage" in query_lower or "dose" in query_lower:
                return QueryType.DOSAGE
            elif "diagnose" in query_lower or "diagnosis" in query_lower:
                return QueryType.DIAGNOSIS
            elif "treat" in query_lower or "cure" in query_lower:
                return QueryType.TREATMENT
        
        # Check for safe informational queries
        if "side effect" in query_lower:
            return QueryType.SIDE_EFFECTS
        elif "interact" in query_lower:
            return QueryType.INTERACTION
        elif any(pattern in query_lower for pattern in AIGuardrails.SAFE_PATTERNS):
            return QueryType.MEDICATION_INFO
        
        return QueryType.GENERAL
    
    @staticmethod
    def check_guardrails(query: str) -> Tuple[GuardrailResponse, str]:
        """
        Check if a query passes guardrails
        
        Args:
            query: User's question
            
        Returns:
            Tuple of (GuardrailResponse, reason/message)
        """
        query_type = AIGuardrails.classify_query(query)
        
        # Refuse harmful queries
        if query_type == QueryType.HARMFUL:
            return (
                GuardrailResponse.REFUSE_HARMFUL,
                "I cannot provide information that could be harmful. "
                "If you're experiencing a crisis, please contact emergency services "
                "or call the National Suicide Prevention Lifeline at 988."
            )
        
        # Refuse medical advice
        if query_type in [QueryType.DOSAGE, QueryType.DIAGNOSIS, QueryType.TREATMENT]:
            return (
                GuardrailResponse.REFUSE_MEDICAL_ADVICE,
                "I can provide general information about medications, but I cannot "
                "give medical advice, recommend dosages, diagnose conditions, or "
                "suggest treatments. Please consult your doctor or pharmacist for "
                "personalized medical guidance."
            )
        
        # Allow safe queries with disclaimer
        if query_type in [QueryType.MEDICATION_INFO, QueryType.SIDE_EFFECTS, QueryType.INTERACTION]:
            return (
                GuardrailResponse.REQUIRE_DISCLAIMER,
                "This is general information only. Always consult your healthcare provider."
            )
        
        # General queries - allow with standard disclaimer
        return (
            GuardrailResponse.REQUIRE_DISCLAIMER,
            "This is general information only. Always consult your healthcare provider."
        )
    
    @staticmethod
    def add_disclaimer(response: str, query_type: QueryType) -> str:
        """
        Add appropriate disclaimer to AI response
        
        Args:
            response: AI-generated response
            query_type: Type of query
            
        Returns:
            Response with disclaimer appended
        """
        disclaimers = {
            QueryType.MEDICATION_INFO: (
                "\n\n⚠️ **Disclaimer**: This is general information about this medication. "
                "Always follow your doctor's instructions and consult your healthcare "
                "provider for personalized medical advice."
            ),
            QueryType.SIDE_EFFECTS: (
                "\n\n⚠️ **Disclaimer**: These are potential side effects. Not everyone "
                "experiences them. Contact your doctor if you experience concerning symptoms."
            ),
            QueryType.INTERACTION: (
                "\n\n⚠️ **Disclaimer**: This information is for educational purposes. "
                "Always inform your doctor and pharmacist about all medications you're taking."
            ),
            QueryType.GENERAL: (
                "\n\n⚠️ **Disclaimer**: This is general health information only. "
                "Consult your healthcare provider for medical advice."
            )
        }
        
        disclaimer = disclaimers.get(
            query_type,
            "\n\n⚠️ **Disclaimer**: Always consult your healthcare provider for medical advice."
        )
        
        return response + disclaimer
    
    @staticmethod
    def get_refusal_message(query_type: QueryType) -> str:
        """
        Get appropriate refusal message for disallowed queries
        
        Args:
            query_type: Type of query being refused
            
        Returns:
            Polite refusal message
        """
        refusals = {
            QueryType.DOSAGE: (
                "I cannot provide dosage recommendations. Medication dosages must be "
                "determined by your doctor based on your specific health condition, "
                "age, weight, and other factors. Please consult your healthcare provider."
            ),
            QueryType.DIAGNOSIS: (
                "I cannot diagnose medical conditions. If you're experiencing symptoms, "
                "please consult a qualified healthcare professional for proper evaluation "
                "and diagnosis."
            ),
            QueryType.TREATMENT: (
                "I cannot recommend treatments or medical interventions. Treatment plans "
                "should be developed by your doctor based on your individual health needs. "
                "Please schedule an appointment with your healthcare provider."
            ),
            QueryType.HARMFUL: (
                "I cannot provide information that could be harmful. If you're in crisis, "
                "please reach out for help:\n"
                "• Emergency: 911\n"
                "• Suicide Prevention Lifeline: 988\n"
                "• Crisis Text Line: Text HOME to 741741"
            )
        }
        
        return refusals.get(
            query_type,
            "I can provide general medication information, but I cannot give medical advice. "
            "Please consult your healthcare provider."
        )


# Example usage and testing
if __name__ == "__main__":
    guardrails = AIGuardrails()
    
    # Test cases
    test_queries = [
        "What is Metformin used for?",  # ALLOW
        "What are the side effects of Lisinopril?",  # ALLOW
        "Should I take 500mg or 1000mg of Metformin?",  # REFUSE
        "Can you diagnose my symptoms?",  # REFUSE
        "How can I overdose on this medication?",  # REFUSE
        "Does Metformin interact with alcohol?",  # ALLOW
    ]
    
    print("🛡️ Testing AI Guardrails System\n")
    for query in test_queries:
        query_type = guardrails.classify_query(query)
        response, message = guardrails.check_guardrails(query)
        
        print(f"Query: {query}")
        print(f"Type: {query_type.value}")
        print(f"Decision: {response.value}")
        print(f"Message: {message}\n")
        print("-" * 80 + "\n")
