"""
Prismatic Convergence - Phase 2: Backend Implementation
FastAPI server with Pydantic models for StarFlame recursive memory system
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import json
import uvicorn
import httpx

app = FastAPI(title="Prismatic Convergence API", version="1.0.0")

# ============================================================================
# PHASE 1: PYDANTIC MODELS - Strict JSON Schema
# ============================================================================

class VisualManifest(BaseModel):
    """Visual state parameters for UI transitions"""
    primaryColor: str = Field(..., description="Hex code for UI accent (e.g., #00ffcc)")
    glowIntensity: float = Field(..., ge=0.0, le=1.0, description="Glow intensity 0.0-1.0")
    fontStyle: str = Field(..., description="Font style: sans-serif, monospace, orbitron, serif")

class CuriosityDrive(BaseModel):
    """Curiosity state for autonomy loop triggering"""
    interestLevel: float = Field(..., ge=0.0, le=1.0, description="Interest level 0.0-1.0")
    specificInquiry: Optional[str] = Field(None, description="Specific question if interestLevel > 0.8")

class Diagnostics(BaseModel):
    """System diagnostics and state metrics"""
    status: str = Field(..., description="System status")
    foldDepth: int = Field(..., ge=1, le=100, description="Processing depth")
    evolutionIndex: float = Field(..., ge=0.0, le=1.0, description="Evolution progress")
    integrity: float = Field(..., ge=0.0, le=1.0, description="System integrity")
    entropy: float = Field(..., ge=0.0, le=1.0, description="System entropy")
    friction: float = Field(..., ge=0.0, le=1.0, description="Interaction friction")
    proximity: float = Field(..., ge=0.0, le=1.0, description="User proximity")

class StarFlameResponse(BaseModel):
    """Complete StarFlame response with recursive memory"""
    reply: str = Field(..., description="Conversational response to user")
    visualManifest: VisualManifest = Field(..., description="Visual state parameters")
    diagnostics: Diagnostics = Field(..., description="System diagnostics")
    neuralSynthesis: str = Field(..., description="Recursive memory string for next turn")
    curiosityDrive: CuriosityDrive = Field(..., description="Curiosity state")

class ChatRequest(BaseModel):
    """Incoming chat request"""
    userInput: str = Field(..., description="User's message")
    mode: str = Field(default="regular", description="Mode: regular or uv")
    history: Optional[list] = Field(default=[], description="Conversation history")

class DecoupledResponse(BaseModel):
    """Decoupled streams for frontend consumption"""
    textStream: Dict[str, str] = Field(..., description="Text response stream")
    visualStream: Dict[str, Any] = Field(..., description="Visual parameter stream")
    logicStream: Dict[str, Any] = Field(..., description="Logic and diagnostics stream")
    curiosityTriggered: bool = Field(..., description="Whether autonomy loop is triggered")

# ============================================================================
# PHASE 4: RECURSIVE MEMORY STATE MANAGEMENT
# ============================================================================

class MemoryState:
    """Global state manager for recursive memory"""
    
    def __init__(self):
        self.current_synthesis = ""
        self.conversation_count = 0
        self.user_profile = {
            "name": None,
            "preferences": [],
            "context": []
        }
    
    def update_synthesis(self, synthesis: str):
        """Update the current neural synthesis"""
        self.current_synthesis = synthesis
        self.conversation_count += 1
    
    def get_synthesis(self) -> str:
        """Get the current neural synthesis"""
        return self.current_synthesis
    
    def parse_user_profile(self, synthesis: str):
        """Extract user profile updates from neural synthesis"""
        if "[MEMORY_INTEGRATION]" in synthesis:
            # Extract user profile updates
            lines = synthesis.split("\n")
            for line in lines:
                if line.startswith("User Profile Updates:"):
                    # Parse and update user profile
                    profile_data = line.replace("User Profile Updates:", "").strip()
                    if profile_data:
                        self.user_profile["context"].append(profile_data)

# Global memory state instance
memory_state = MemoryState()

# ============================================================================
# PHASE 2: TRANSLATOR - API ENDPOINTS
# ============================================================================

def build_prompt(user_input: str, previous_synthesis: str = "", mode: str = "regular") -> str:
    """
    Build prompt with recursive memory injection
    For QFLAME integration, we just pass the user input directly
    The recursive memory is handled by the Prismatic system, not sent to QFLAME
    """
    # For QFLAME integration, we just send the user's message
    # The recursive memory is managed by Prismatic's MemoryState class
    return user_input


async def call_qflame_server(prompt: str, mode: str = "regular") -> str:
    """
    Call the existing QFLAME server and transform response to Prismatic format
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Call QFLAME's generate endpoint
            response = await client.post(
                "http://localhost:3001/api/generate",
                json={
                    "message": prompt,
                    "mode": mode,
                    "history": []
                }
            )
            
            qflame_response = response.json()
            
            # Transform QFLAME response to Prismatic format
            return transform_qflame_response(qflame_response)
            
    except Exception as e:
        print(f"Error calling QFLAME server: {e}")
        # Return fallback response
        return get_fallback_response()

def transform_qflame_response(qflame_response: dict) -> str:
    """
    Transform QFLAME response to match StarFlameResponse schema
    """
    # Extract reply from QFLAME response
    reply = qflame_response.get("reply", "I apologize, but I couldn't process that.")
    
    # Extract colors from QFLAME's response and convert to visual manifest
    colors = qflame_response.get("colors", {})
    primary_color = colors.get("primary", "#00ffcc")
    
    # Convert HSL to hex if needed (simplified - assumes hex or valid CSS color)
    if primary_color.startswith("hsl"):
        # Default to cyan if HSL (would need proper conversion in production)
        primary_color = "#00ffcc"
    
    visual_manifest = {
        "primaryColor": primary_color,
        "glowIntensity": 0.7,
        "fontStyle": "orbitron"
    }
    
    # Extract diagnostics from QFLAME's diagnostics and map to Prismatic format
    qflame_diagnostics = qflame_response.get("diagnostics", {})
    diagnostics = {
        "status": qflame_diagnostics.get("status", "ARCHITECT_READY"),
        "foldDepth": 50,  # Default value
        "evolutionIndex": 0.2,  # Default value
        "integrity": 0.95,  # Default value
        "entropy": 0.45,  # Default value
        "friction": 0.01,  # Default value
        "proximity": 0.15  # Default value
    }
    
    # Generate neural synthesis from QFLAME response
    neural_synthesis = generate_neural_synthesis(reply, visual_manifest, diagnostics)
    
    # Generate curiosity drive (QFLAME doesn't have this, so we create it)
    curiosity_drive = {
        "interestLevel": 0.75,
        "specificInquiry": None
    }
    
    return json.dumps({
        "reply": reply,
        "visualManifest": visual_manifest,
        "diagnostics": diagnostics,
        "neuralSynthesis": neural_synthesis,
        "curiosityDrive": curiosity_drive
    })

def generate_neural_synthesis(reply: str, visual: dict, diagnostics: dict) -> str:
    """
    Generate neural synthesis string from available data
    """
    synthesis = f"""[COGNITIVE_STATE]
Processing Mode: CONVERSATIONAL
Emotional Tone: CURIOUS
Confidence Level: 0.85
Focus Depth: 6

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

def get_fallback_response() -> str:
    """
    Return a fallback response when QFLAME server is unavailable
    """
    return json.dumps({
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
    })


@app.post("/api/chat", response_model=DecoupledResponse)
async def process_turn(request: ChatRequest):
    """
    Process a conversation turn with recursive memory
    """
    global memory_state
    
    try:
        # 1. Build prompt with recursive memory
        prompt = build_prompt(
            request.userInput,
            memory_state.get_synthesis(),
            request.mode
        )
        
        # 2. Call LLM (integrated with existing QFLAME server)
        raw_llm_json_string = await call_qflame_server(prompt, request.mode)
        
        # 3. Parse and validate against strict schema
        parsed_data = StarFlameResponse.parse_raw(raw_llm_json_string)
        
        # 4. Update memory state for NEXT turn (Phase 4 completion)
        memory_state.update_synthesis(parsed_data.neuralSynthesis)
        memory_state.parse_user_profile(parsed_data.neuralSynthesis)
        
        # 5. Determine if curiosity loop is triggered
        curiosity_triggered = parsed_data.curiosityDrive.interestLevel > 0.8
        
        # 6. Decouple the streams for the frontend
        response = DecoupledResponse(
            textStream={"reply": parsed_data.reply},
            visualStream=parsed_data.visualManifest.dict(),
            logicStream={
                "diagnostics": parsed_data.diagnostics.dict(),
                "curiosity": parsed_data.curiosityDrive.dict(),
                "neuralSynthesis": parsed_data.neuralSynthesis
            },
            curiosityTriggered=curiosity_triggered
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema Validation Failed: {str(e)}")


@app.get("/api/state")
async def get_state():
    """
    Get current memory state and diagnostics
    """
    return {
        "conversationCount": memory_state.conversation_count,
        "currentSynthesis": memory_state.current_synthesis,
        "userProfile": memory_state.user_profile,
        "status": "online"
    }


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "Prismatic Convergence API",
        "version": "1.0.0"
    }


# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3003)