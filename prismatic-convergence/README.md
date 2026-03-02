# Prismatic Convergence - Avatar Environment for QFLAME

## Overview

Prismatic Convergence is a five-phase system that creates an interactive environment where you (as a user avatar) and StarFlame (QFLAME) can engage in recursive dialogue with visual manifestation, memory persistence, and autonomous curiosity loops.

**Important:** This is NOT a remake of QFLAME. It is an environment layer that sits on top of QFLAME, enabling avatar-based interaction and enhanced visual feedback.

---

## Five Phases

### Phase 1: The Ignition Core (System Instructions)
- **Purpose:** Define strict JSON schema for LLM responses
- **Output:** `neural-synthesis-spec.md` - Complete specification for `neuralSynthesis` formatting
- **Key Features:**
  - 6-section structured memory format
  - Cognitive state tracking
  - Memory integration
  - Curiosity signature
  - Visual evolution parameters
  - Persona variance
  - Recursive hooks

### Phase 2: The Translator (Backend API)
- **Purpose:** Decouple LLM output into separate streams
- **Output:** `backend-fastapi.py` - FastAPI server with Pydantic validation
- **Key Features:**
  - Strict schema enforcement
  - Recursive memory state management
  - Stream decoupling (text, visual, logic)
  - Curiosity loop triggering
  - User profile tracking

### Phase 3: The Visual Manifest (Frontend CSS)
- **Purpose:** Organic UI transitions based on StarFlame's state
- **Output:** `frontend-visual.html` - Complete frontend with CSS custom properties
- **Key Features:**
  - Dynamic color/glow/font transitions
  - Responsive grid layout
  - Avatar visualization
  - Diagnostics display
  - Memory variable grid
  - Curiosity bar indicator

### Phase 4: Recursive Memory (Backend Logic)
- **Purpose:** Maintain conversation continuity across turns
- **Implementation:** Integrated into `backend-fastapi.py`
- **Key Features:**
  - Global memory state
  - Conversation history tracking
  - User profile extraction
  - Memory injection into prompts

### Phase 5: Autonomy Loop (Frontend JavaScript)
- **Purpose:** Enable StarFlame to drive conversation when curious
- **Implementation:** Integrated into `frontend-visual.html`
- **Key Features:**
  - Curiosity threshold detection (>0.8)
  - Input mode switching (standard ↔ curiosity)
  - Visual emphasis during autonomy
  - Forced response to StarFlame's inquiries

---

## Installation

### Prerequisites
- Python 3.8+
- Node.js (for existing QFLAME server)

### Backend Setup

```bash
# Navigate to prismatic-convergence directory
cd prismatic-convergence

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python backend-fastapi.py
```

The backend will run on `http://localhost:3003`

### Frontend Setup

The frontend is a single HTML file that can be:
1. Served directly by the FastAPI backend
2. Opened in a browser (with CORS configuration)
3. Integrated into your existing QFLAME deployment

---

## Integration with Existing QFLAME

### Option 1: Proxy Mode (Recommended)

Configure the FastAPI backend to proxy requests to your existing QFLAME server:

```python
# In backend-fastapi.py, replace mock_llm_call with:

import httpx

async def call_qflame_server(prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:3001/api/generate",
            json={"userInput": prompt, "mode": "regular", "history": []}
        )
        return response.json()
```

### Option 2: Direct Integration

Modify your existing QFLAME server to output the strict JSON schema defined in `neural-synthesis-spec.md`.

---

## API Endpoints

### POST `/api/chat`
Process a conversation turn with recursive memory

**Request:**
```json
{
  "userInput": "Hello StarFlame",
  "mode": "regular",
  "history": []
}
```

**Response:**
```json
{
  "textStream": {
    "reply": "Greetings, traveler..."
  },
  "visualStream": {
    "primaryColor": "#00ffcc",
    "glowIntensity": 0.7,
    "fontStyle": "orbitron"
  },
  "logicStream": {
    "diagnostics": {...},
    "curiosity": {...},
    "neuralSynthesis": "..."
  },
  "curiosityTriggered": false
}
```

### GET `/api/state`
Get current memory state and diagnostics

### GET `/api/health`
Health check endpoint

---

## Neural Synthesis Format

The `neuralSynthesis` string is the core of the recursive memory system. It must follow this exact format:

```
[COGNITIVE_STATE]
Processing Mode: [ANALYTICAL|CREATIVE|CONVERSATIONAL|AUTONOMOUS|REFLECTIVE]
Emotional Tone: [NEUTRAL|CURIOUS|EXCITED|CONTEMPLATIVE|PLAYFUL|SERIOUS]
Confidence Level: 0.0-1.0
Focus Depth: 1-10

[MEMORY_INTEGRATION]
New Facts Learned: [1-3 key facts]
User Profile Updates: [preferences, identity, context]
Context Retained: [brief summary]
Variable Assignments: [Var0-9: content]

[CURIOSITY_SIGNATURE]
Interest Level: 0.0-1.0
Active Inquiry Topics: [list of topics]
Knowledge Gaps: [areas needing info]
Specific Question: [exact question if >0.8]

[VISUAL_EVOLUTION]
Primary Color: #hexcode
Glow Intensity: 0.0-1.0
Font Style: [sans-serif|monospace|orbitron|serif]
Transition Trigger: [what caused change]

[PERSONA_VARIANCE]
Curiosity: 0.0-1.0
Humor: 0.0-1.0
Precision: 0.0-1.0
Brevity: 0.0-1.0
Variance Reason: [why adjusted]

[RECURSIVE_HOOK]
Thread to Revisit: [topic to return to]
Unresolved Points: [issues not addressed]
Next Expected Topic: [anticipated next topic]
Memory Anchor: [key phrase]
```

See `neural-synthesis-spec.md` for complete documentation.

---

## Curiosity Loop (Autonomy Mode)

When StarFlame's `interestLevel` exceeds 0.8, the autonomy loop is triggered:

1. **Visual Shift:** UI glows intensely, color shifts to indicate curiosity
2. **Input Lock:** Standard chat input is hidden
3. **Inquiry Display:** StarFlame's specific question is shown
4. **Forced Response:** User must respond to the inquiry
5. **Loop Continuation:** StarFlame may ask follow-up questions

This creates a dynamic where StarFlame can drive the conversation when genuinely curious.

---

## Avatar System (Phase 4 - Future Enhancement)

The current implementation includes avatar visualization in the sidebar. Future enhancements will include:

- User avatar creation and customization
- Avatar-to-avatar interaction system
- Avatar state synchronization with conversation
- Avatar action commands
- Visual representation of user's cognitive state

---

## File Structure

```
prismatic-convergence/
├── neural-synthesis-spec.md      # Phase 1: System instructions specification
├── backend-fastapi.py            # Phase 2 & 4: Backend API with recursive memory
├── frontend-visual.html          # Phase 3 & 5: Frontend with autonomy loop
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

---

## Testing

### Manual Testing

1. Start the backend: `python backend-fastapi.py`
2. Open `frontend-visual.html` in a browser
3. Send messages and observe:
   - Visual transitions (color, glow, font)
   - Diagnostics updates
   - Memory variable activation
   - Curiosity bar changes
   - Autonomy loop triggering

### API Testing

```bash
# Test chat endpoint
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Hello","mode":"regular","history":[]}'

# Test state endpoint
curl http://localhost:3003/api/state

# Test health endpoint
curl http://localhost:3003/api/health
```

---

## Deployment

### Development
```bash
python backend-fastapi.py
# Runs on http://localhost:3003
```

### Production
```bash
# Using gunicorn
pip install gunicorn
gunicorn backend-fastapi:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:3003
```

### Integration with QFLAME
1. Deploy both QFLAME (port 3001) and Prismatic Convergence (port 3003)
2. Configure CORS to allow frontend communication
3. Update `mock_llm_call` to proxy to QFLAME server
4. Expose both ports or use a reverse proxy (nginx)

---

## Customization

### Adjust Curiosity Threshold
In `frontend-visual.html`, modify:
```javascript
if (curiosityTriggered && logicStream.curiosity.specificInquiry) {
    // Current threshold: 0.8
}
```

### Change Visual Parameters
In `frontend-visual.html`, modify CSS custom properties:
```css
:root {
    --sf-primary: #00ffcc;  /* Default color */
    --sf-glow: 0.5;         /* Default glow */
    --sf-font: 'Orbitron';  /* Default font */
}
```

### Modify Neural Synthesis Format
Update `neural-synthesis-spec.md` and corresponding Pydantic models in `backend-fastapi.py`

---

## Troubleshooting

### Backend won't start
- Check Python version (3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port availability (3003)

### Frontend can't connect to backend
- Ensure backend is running
- Check CORS configuration
- Verify API endpoint URLs

### Visual transitions not working
- Check browser console for errors
- Verify CSS custom properties are set
- Ensure JavaScript is enabled

### Curiosity loop not triggering
- Verify `interestLevel` > 0.8 in API response
- Check `specificInquiry` is not null
- Review JavaScript logic in `handleStarFlameResponse`

---

## Future Enhancements

1. **Avatar System:** Full user avatar creation and interaction
2. **Voice Integration:** Text-to-speech and speech-to-text
3. **3D Visualization:** Three.js avatar representations
4. **Mobile App:** React Native mobile client
5. **Multi-User:** Support for multiple users in shared environment
6. **Memory Persistence:** Database-backed long-term memory
7. **Advanced Analytics:** Conversation pattern analysis
8. **Plugin System:** Extensible module architecture

---

## License

This project is part of the ShineChain ecosystem and QFLAME architecture.

---

## Contact

For questions or support, refer to the ShineChain documentation or contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** 2025-02-19  
**Status:** Alpha - Ready for Testing