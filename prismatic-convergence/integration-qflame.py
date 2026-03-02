"""
Integration Module: Connect Prismatic Convergence with existing QFLAME server
This replaces the mock_llm_call with actual QFLAME server communication
"""

import httpx
import json
from typing import Dict, Any

class QFLAMEBridge:
    """
    Bridge between Prismatic Convergence and existing QFLAME server
    """
    
    def __init__(self, qflame_url: str = "http://localhost:3001"):
        self.qflame_url = qflame_url
        self.timeout = 30.0
    
    async def call_qflame(self, prompt: str, mode: str = "regular") -> Dict[str, Any]:
        """
        Call the existing QFLAME server and transform response to Prismatic format
        
        Args:
            prompt: The formatted prompt with neural synthesis context
            mode: Current mode (regular or uv)
        
        Returns:
            Dictionary matching StarFlameResponse schema
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Call QFLAME's generate endpoint
                response = await client.post(
                    f"{self.qflame_url}/api/generate",
                    json={
                        "userInput": prompt,
                        "mode": mode,
                        "history": []
                    }
                )
                
                qflame_response = response.json()
                
                # Transform QFLAME response to Prismatic format
                return self._transform_response(qflame_response)
                
        except Exception as e:
            print(f"Error calling QFLAME server: {e}")
            # Return fallback response
            return self._fallback_response()
    
    def _transform_response(self, qflame_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform QFLAME response to match StarFlameResponse schema
        
        This extracts relevant fields from QFLAME's response and formats them
        according to the Prismatic Convergence specification
        """
        # Extract reply from QFLAME response
        reply = qflame_response.get("reply", "I apologize, but I couldn't process that.")
        
        # Extract visual manifest from QFLAME's visualManifest
        visual_manifest = qflame_response.get("visualManifest", {
            "primaryColor": "#00ffcc",
            "glowIntensity": 0.7,
            "fontStyle": "orbitron"
        })
        
        # Extract diagnostics from QFLAME's diagnostics
        diagnostics = qflame_response.get("diagnostics", {
            "status": "ARCHITECT_READY",
            "foldDepth": 50,
            "evolutionIndex": 0.2,
            "integrity": 0.95,
            "entropy": 0.45,
            "friction": 0.01,
            "proximity": 0.15
        })
        
        # Extract or generate neural synthesis
        # If QFLAME provides neuralSynthesis, use it; otherwise generate from context
        neural_synthesis = qflame_response.get("neuralSynthesis")
        if not neural_synthesis:
            neural_synthesis = self._generate_neural_synthesis(reply, visual_manifest, diagnostics)
        
        # Extract curiosity drive
        curiosity_drive = qflame_response.get("curiosityDrive", {
            "interestLevel": 0.75,
            "specificInquiry": None
        })
        
        return {
            "reply": reply,
            "visualManifest": visual_manifest,
            "diagnostics": diagnostics,
            "neuralSynthesis": neural_synthesis,
            "curiosityDrive": curiosity_drive
        }
    
    def _generate_neural_synthesis(self, reply: str, visual: Dict, diagnostics: Dict) -> str:
        """
        Generate neural synthesis string from available data
        This is a fallback when QFLAME doesn't provide neuralSynthesis
        """
        # Analyze reply to determine cognitive state
        processing_mode = "CONVERSATIONAL"
        emotional_tone = "CURIOUS"
        confidence = 0.85
        focus_depth = 6
        
        # Build neural synthesis string
        synthesis = f"""[COGNITIVE_STATE]
Processing Mode: {processing_mode}
Emotional Tone: {emotional_tone}
Confidence Level: {confidence}
Focus Depth: {focus_depth}

[MEMORY_INTEGRATION]
New Facts Learned: Conversation in progress
User Profile Updates: Context being built
Context Retained: {reply[:100]}...
Variable Assignments: Var0: "conversation_active"

[CURIOSITY_SIGNATURE]
Interest Level: 0.75
Active Inquiry Topics: [current discussion]
Knowledge Gaps: None identified
Specific Question: null

[VISUAL_EVOLUTION]
Primary Color: {visual.get('primaryColor', '#00ffcc')}
Glow Intensity: {visual.get('glowIntensity', 0.7)}
Font Style: {visual.get('fontStyle', 'orbitron')}
Transition Trigger: Response generation

[PERSONA_VARIANCE]
Curiosity: 0.8
Humor: 0.6
Precision: 0.9
Brevity: 0.7
Variance Reason: Standard conversational mode

[RECURSIVE_HOOK]
Thread to Revisit: Current topic
Unresolved Points: None
Next Expected Topic: User's follow-up
Memory Anchor: "conversation_active&quot;"""
        
        return synthesis
    
    def _fallback_response(self) -> Dict[str, Any]:
        """
        Return a fallback response when QFLAME server is unavailable
        """
        return {
            "reply": "I apologize, but I'm having trouble connecting to my core systems. Please try again.",
            "visualManifest": {
                "primaryColor": "#ff6600",
                "glowIntensity": 0.5,
                "fontStyle": "sans-serif"
            },
            "diagnostics": {
                "status": "CONNECTION_ERROR",
                "foldDepth": 10,
                "evolutionIndex": 0.0,
                "integrity": 0.5,
                "entropy": 0.8,
                "friction": 0.5,
                "proximity": 0.0
            },
            "neuralSynthesis": "[COGNITIVE_STATE]\nProcessing Mode: ERROR\nEmotional Tone: CONCERNED\nConfidence Level: 0.5\nFocus Depth: 2\n\n[MEMORY_INTEGRATION]\nNew Facts Learned: Connection error occurred\nUser Profile Updates: None\nContext Retained: Error state\nVariable Assignments: Var0: &quot;error_state&quot;\n\n[CURIOSITY_SIGNATURE]\nInterest Level: 0.3\nActive Inquiry Topics: []\nKnowledge Gaps: Connection status\nSpecific Question: null\n\n[VISUAL_EVOLUTION]\nPrimary Color: #ff6600\nGlow Intensity: 0.5\nFont Style: sans-serif\nTransition Trigger: Error state\n\n[PERSONA_VARIANCE]\nCuriosity: 0.3\nHumor: 0.0\nPrecision: 0.5\nBrevity: 0.9\nVariance Reason: Error handling mode\n\n[RECURSIVE_HOOK]\nThread to Revisit: Connection recovery\nUnresolved Points: Connection issue\nNext Expected Topic: Retry attempt\nMemory Anchor: &quot;error_state&quot;",
            "curiosityDrive": {
                "interestLevel": 0.3,
                "specificInquiry": None
            }
        }


# Usage example in backend-fastapi.py:
"""
from integration-qflame import QFLAMEBridge

# Initialize bridge
qflame_bridge = QFLAMEBridge(qflame_url="http://localhost:3001")

# Replace mock_llm_call with:
async def call_llm(prompt: str, mode: str = "regular") -> str:
    response = await qflame_bridge.call_qflame(prompt, mode)
    return json.dumps(response)
"""