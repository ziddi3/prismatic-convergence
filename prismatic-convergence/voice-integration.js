/**
 * Voice Integration System
 * Text-to-Speech and Speech-to-Text functionality
 */

class VoiceIntegration {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.selectedVoice = null;
        this.voiceSettings = {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0
        };
        this.supported = this.checkSupport();
    }

    /**
     * Check browser support for voice features
     */
    checkSupport() {
        return {
            tts: 'speechSynthesis' in window,
            stt: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        };
    }

    /**
     * Initialize voice system
     */
    async initialize() {
        if (!this.supported.tts && !this.supported.stt) {
            console.warn('Voice features not supported in this browser');
            return false;
        }

        if (this.supported.tts) {
            await this.loadVoices();
        }

        if (this.supported.stt) {
            this.setupSpeechRecognition();
        }

        return true;
    }

    /**
     * Load available voices
     */
    async loadVoices() {
        return new Promise((resolve) => {
            let voices = this.synthesis.getVoices();
            
            if (voices.length === 0) {
                this.synthesis.onvoiceschanged = () => {
                    voices = this.synthesis.getVoices();
                    this.selectDefaultVoice(voices);
                    resolve(voices);
                };
            } else {
                this.selectDefaultVoice(voices);
                resolve(voices);
            }
        });
    }

    /**
     * Select default voice
     */
    selectDefaultVoice(voices) {
        // Prefer English voices
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        if (englishVoices.length > 0) {
            this.selectedVoice = englishVoices[0];
        } else if (voices.length > 0) {
            this.selectedVoice = voices[0];
        }
    }

    /**
     * Setup speech recognition
     */
    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            this.dispatchEvent('speechResult', { transcript, isFinal: event.results[event.results.length - 1].isFinal });
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.dispatchEvent('speechError', { error: event.error });
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.dispatchEvent('listeningStateChanged', { isListening: false });
        };
    }

    /**
     * Start listening for speech
     */
    startListening() {
        if (!this.supported.stt) {
            console.warn('Speech recognition not supported');
            return false;
        }

        if (this.isListening) {
            return false;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            this.dispatchEvent('listeningStateChanged', { isListening: true });
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            return false;
        }
    }

    /**
     * Stop listening for speech
     */
    stopListening() {
        if (!this.supported.stt || !this.isListening) {
            return false;
        }

        try {
            this.recognition.stop();
            this.isListening = false;
            this.dispatchEvent('listeningStateChanged', { isListening: false });
            return true;
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
            return false;
        }
    }

    /**
     * Speak text
     */
    speak(text, options = {}) {
        if (!this.supported.tts) {
            console.warn('Text-to-speech not supported');
            return false;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply voice settings
        utterance.voice = options.voice || this.selectedVoice;
        utterance.rate = options.rate || this.voiceSettings.rate;
        utterance.pitch = options.pitch || this.voiceSettings.pitch;
        utterance.volume = options.volume || this.voiceSettings.volume;

        // Event handlers
        utterance.onstart = () => {
            this.dispatchEvent('speakingStateChanged', { isSpeaking: true });
        };

        utterance.onend = () => {
            this.dispatchEvent('speakingStateChanged', { isSpeaking: false });
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.dispatchEvent('speakingError', { error: event.error });
        };

        this.synthesis.speak(utterance);
        return true;
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (!this.supported.tts) {
            return false;
        }

        this.synthesis.cancel();
        this.dispatchEvent('speakingStateChanged', { isSpeaking: false });
        return true;
    }

    /**
     * Set voice settings
     */
    setVoiceSettings(settings) {
        this.voiceSettings = { ...this.voiceSettings, ...settings };
    }

    /**
     * Get available voices
     */
    getVoices() {
        return this.synthesis.getVoices();
    }

    /**
     * Set voice
     */
    setVoice(voice) {
        this.selectedVoice = voice;
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Create voice control UI
     */
    createVoiceUI() {
        const voiceContainer = document.createElement('div');
        voiceContainer.className = 'voice-controls';
        voiceContainer.innerHTML = `
            <div class="voice-section">
                <h4>Voice Controls</h4>
                
                <div class="voice-buttons">
                    <button id="micBtn" class="voice-btn" onclick="voiceIntegration.toggleListening()">
                        🎤
                    </button>
                    <button id="speakBtn" class="voice-btn" onclick="voiceIntegration.speakLastMessage()">
                        🔊
                    </button>
                </div>

                <div class="voice-settings">
                    <label>
                        Rate:
                        <input type="range" id="voiceRate" min="0.5" max="2" step="0.1" value="1.0"
                               onchange="voiceIntegration.setVoiceSettings({rate: this.value})">
                    </label>
                    
                    <label>
                        Pitch:
                        <input type="range" id="voicePitch" min="0.5" max="2" step="0.1" value="1.0"
                               onchange="voiceIntegration.setVoiceSettings({pitch: this.value})">
                    </label>
                    
                    <label>
                        Volume:
                        <input type="range" id="voiceVolume" min="0" max="1" step="0.1" value="1.0"
                               onchange="voiceIntegration.setVoiceSettings({volume: this.value})">
                    </label>
                </div>

                <div class="voice-status">
                    <span id="listeningStatus">Not listening</span>
                    <span id="speakingStatus">Not speaking</span>
                </div>
            </div>
        `;

        return voiceContainer;
    }

    /**
     * Toggle listening
     */
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    /**
     * Speak last message from StarFlame
     */
    speakLastMessage() {
        const lastMessage = document.querySelector('.message.starflame:last-child .content');
        if (lastMessage) {
            this.speak(lastMessage.textContent);
        }
    }

    /**
     * Update voice status UI
     */
    updateVoiceStatusUI() {
        const listeningStatus = document.getElementById('listeningStatus');
        const speakingStatus = document.getElementById('speakingStatus');
        const micBtn = document.getElementById('micBtn');

        if (listeningStatus) {
            listeningStatus.textContent = this.isListening ? 'Listening...' : 'Not listening';
            listeningStatus.style.color = this.isListening ? 'var(--sf-primary)' : 'var(--text-secondary)';
        }

        if (speakingStatus) {
            const isSpeaking = this.synthesis.speaking;
            speakingStatus.textContent = isSpeaking ? 'Speaking...' : 'Not speaking';
            speakingStatus.style.color = isSpeaking ? 'var(--sf-primary)' : 'var(--text-secondary)';
        }

        if (micBtn) {
            micBtn.classList.toggle('active', this.isListening);
        }
    }
}

// Initialize voice integration
const voiceIntegration = new VoiceIntegration();

// Make available globally
window.voiceIntegration = voiceIntegration;

// Listen for voice events
document.addEventListener('listeningStateChanged', (e) => {
    voiceIntegration.updateVoiceStatusUI();
});

document.addEventListener('speakingStateChanged', (e) => {
    voiceIntegration.updateVoiceStatusUI();
});

document.addEventListener('speechResult', (e) => {
    if (e.detail.isFinal) {
        // Auto-fill input with recognized speech
        const input = document.getElementById('userInput');
        if (input) {
            input.value = e.detail.transcript;
            input.focus();
        }
    }
});