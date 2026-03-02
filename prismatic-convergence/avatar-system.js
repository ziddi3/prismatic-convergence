/**
 * Avatar System - Phase 4 Implementation
 * Full user avatar creation, customization, and interaction system
 */

class AvatarSystem {
    constructor() {
        this.userAvatar = null;
        this.starflameAvatar = null;
        this.avatarState = {
            mood: 'neutral',
            energy: 0.5,
            expression: 'neutral',
            posture: 'idle',
            cognitiveLoad: 0.0
        };
        this.customizationOptions = {
            bodyType: ['humanoid', 'energy', 'crystalline', 'mechanical'],
            colorScheme: ['cyan', 'purple', 'orange', 'green', 'pink'],
            accessories: ['none', 'crown', 'wings', 'aura', 'particles'],
            size: ['small', 'medium', 'large'],
            glowIntensity: [0.3, 0.5, 0.7, 0.9, 1.0]
        };
    }

    /**
     * Initialize the avatar system
     */
    initialize() {
        this.loadAvatarFromStorage();
        this.renderAvatarCreationUI();
        this.setupEventListeners();
    }

    /**
     * Load avatar from localStorage
     */
    loadAvatarFromStorage() {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            this.userAvatar = JSON.parse(savedAvatar);
            this.updateAvatarDisplay();
        }
    }

    /**
     * Save avatar to localStorage
     */
    saveAvatarToStorage() {
        localStorage.setItem('userAvatar', JSON.stringify(this.userAvatar));
    }

    /**
     * Render avatar creation UI
     */
    renderAvatarCreationUI() {
        const avatarContainer = document.getElementById('avatar-creation-panel');
        if (!avatarContainer) return;

        avatarContainer.innerHTML = `
            <div class="avatar-creator">
                <h3>Create Your Avatar</h3>
                
                <div class="avatar-preview" id="avatarPreview">
                    <div class="avatar-visual" id="userAvatarVisual">
                        ${this.userAvatar ? this.renderAvatarVisual(this.userAvatar) : '⚡'}
                    </div>
                </div>

                <div class="avatar-customization">
                    <div class="customization-section">
                        <label>Body Type</label>
                        <select id="bodyType" onchange="avatarSystem.updateAvatarPreview()">
                            ${this.customizationOptions.bodyType.map(type => 
                                `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="customization-section">
                        <label>Color Scheme</label>
                        <div class="color-picker">
                            ${this.customizationOptions.colorScheme.map(color => 
                                `<button class="color-btn" data-color="${color}" 
                                        style="background: ${this.getColorHex(color)}"
                                        onclick="avatarSystem.selectColor('${color}')"></button>`
                            ).join('')}
                        </div>
                    </div>

                    <div class="customization-section">
                        <label>Accessories</label>
                        <select id="accessories" onchange="avatarSystem.updateAvatarPreview()">
                            ${this.customizationOptions.accessories.map(acc => 
                                `<option value="${acc}">${acc.charAt(0).toUpperCase() + acc.slice(1)}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="customization-section">
                        <label>Size</label>
                        <input type="range" id="avatarSize" min="1" max="3" step="1" 
                               value="2" onchange="avatarSystem.updateAvatarPreview()">
                    </div>

                    <div class="customization-section">
                        <label>Glow Intensity</label>
                        <input type="range" id="glowIntensity" min="0.3" max="1.0" step="0.1" 
                               value="0.7" onchange="avatarSystem.updateAvatarPreview()">
                    </div>

                    <button class="create-avatar-btn" onclick="avatarSystem.createAvatar()">
                        Create Avatar
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get hex color from color name
     */
    getColorHex(color) {
        const colors = {
            cyan: '#00ffcc',
            purple: '#a020f0',
            orange: '#ff6600',
            green: '#00ff66',
            pink: '#ff0066'
        };
        return colors[color] || '#00ffcc';
    }

    /**
     * Select color
     */
    selectColor(color) {
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
        this.selectedColor = color;
        this.updateAvatarPreview();
    }

    /**
     * Update avatar preview
     */
    updateAvatarPreview() {
        const bodyType = document.getElementById('bodyType').value;
        const accessories = document.getElementById('accessories').value;
        const size = document.getElementById('avatarSize').value;
        const glowIntensity = document.getElementById('glowIntensity').value;
        const color = this.selectedColor || 'cyan';

        const preview = {
            bodyType,
            color,
            accessories,
            size,
            glowIntensity: parseFloat(glowIntensity)
        };

        document.getElementById('userAvatarVisual').innerHTML = this.renderAvatarVisual(preview);
    }

    /**
     * Render avatar visual
     */
    renderAvatarVisual(avatar) {
        const color = this.getColorHex(avatar.color);
        const sizeMultiplier = avatar.size === 'small' ? 0.8 : avatar.size === 'large' ? 1.2 : 1.0;
        const glowSize = avatar.glowIntensity * 30;

        let visual = '';
        
        // Base avatar based on body type
        switch(avatar.bodyType) {
            case 'humanoid':
                visual = `<div class="avatar-humanoid" style="
                    width: ${80 * sizeMultiplier}px;
                    height: ${120 * sizeMultiplier}px;
                    background: linear-gradient(135deg, ${color}, ${this.darkenColor(color)});
                    border-radius: 40% 40% 45% 45%;
                    box-shadow: 0 0 ${glowSize}px ${color};
                "></div>`;
                break;
            case 'energy':
                visual = `<div class="avatar-energy" style="
                    width: ${100 * sizeMultiplier}px;
                    height: ${100 * sizeMultiplier}px;
                    background: radial-gradient(circle, ${color}, transparent);
                    border-radius: 50%;
                    box-shadow: 0 0 ${glowSize}px ${color}, inset 0 0 ${glowSize/2}px ${color};
                    animation: pulse 2s infinite;
                "></div>`;
                break;
            case 'crystalline':
                visual = `<div class="avatar-crystalline" style="
                    width: ${90 * sizeMultiplier}px;
                    height: ${90 * sizeMultiplier}px;
                    background: linear-gradient(45deg, ${color}, ${this.lightenColor(color)}, ${color});
                    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                    box-shadow: 0 0 ${glowSize}px ${color};
                "></div>`;
                break;
            case 'mechanical':
                visual = `<div class="avatar-mechanical" style="
                    width: ${100 * sizeMultiplier}px;
                    height: ${100 * sizeMultiplier}px;
                    background: ${color};
                    border: 3px solid ${this.lightenColor(color)};
                    border-radius: 10px;
                    box-shadow: 0 0 ${glowSize}px ${color};
                ">
                    <div class="mechanical-eye" style="
                        width: 20px;
                        height: 20px;
                        background: ${this.lightenColor(color)};
                        border-radius: 50%;
                        margin: 35px auto;
                        box-shadow: 0 0 10px ${this.lightenColor(color)};
                    "></div>
                </div>`;
                break;
        }

        // Add accessories
        if (avatar.accessories !== 'none') {
            visual += this.renderAccessory(avatar.accessories, color, glowSize);
        }

        return visual;
    }

    /**
     * Render accessory
     */
    renderAccessory(accessory, color, glowSize) {
        switch(accessory) {
            case 'crown':
                return `<div class="accessory-crown" style="
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 30px;
                    background: linear-gradient(to bottom, #ffd700, #ffaa00);
                    clip-path: polygon(0% 100%, 10% 0%, 20% 100%, 30% 0%, 40% 100%, 50% 0%, 60% 100%, 70% 0%, 80% 100%, 90% 0%, 100% 100%);
                    box-shadow: 0 0 ${glowSize}px #ffd700;
                "></div>`;
            case 'wings':
                return `<div class="accessory-wings" style="
                    position: absolute;
                    top: 20px;
                    width: 200px;
                    height: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                ">
                    <div style="
                        position: absolute;
                        left: 0;
                        width: 80px;
                        height: 60px;
                        background: linear-gradient(135deg, ${color}, transparent);
                        border-radius: 50% 0 50% 50%;
                        box-shadow: 0 0 ${glowSize}px ${color};
                    "></div>
                    <div style="
                        position: absolute;
                        right: 0;
                        width: 80px;
                        height: 60px;
                        background: linear-gradient(225deg, ${color}, transparent);
                        border-radius: 0 50% 50% 50%;
                        box-shadow: 0 0 ${glowSize}px ${color};
                    "></div>
                </div>`;
            case 'aura':
                return `<div class="accessory-aura" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 150px;
                    height: 150px;
                    background: radial-gradient(circle, transparent 30%, ${color} 70%, transparent 100%);
                    border-radius: 50%;
                    animation: rotate 10s linear infinite;
                "></div>`;
            case 'particles':
                return `<div class="accessory-particles" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                ">
                    ${Array(10).fill(0).map((_, i) => `
                        <div style="
                            position: absolute;
                            width: 4px;
                            height: 4px;
                            background: ${color};
                            border-radius: 50%;
                            box-shadow: 0 0 ${glowSize/2}px ${color};
                            animation: float ${2 + Math.random()}s ease-in-out infinite;
                            left: ${Math.random() * 100}%;
                            top: ${Math.random() * 100}%;
                            animation-delay: ${Math.random() * 2}s;
                        "></div>
                    `).join('')}
                </div>`;
            default:
                return '';
        }
    }

    /**
     * Darken color
     */
    darkenColor(hex) {
        const num = parseInt(hex.slice(1), 16);
        const amt = -40;
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    /**
     * Lighten color
     */
    lightenColor(hex) {
        const num = parseInt(hex.slice(1), 16);
        const amt = 40;
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    /**
     * Create avatar
     */
    createAvatar() {
        const bodyType = document.getElementById('bodyType').value;
        const accessories = document.getElementById('accessories').value;
        const size = document.getElementById('avatarSize').value;
        const glowIntensity = document.getElementById('glowIntensity').value;
        const color = this.selectedColor || 'cyan';

        this.userAvatar = {
            id: Date.now(),
            bodyType,
            color,
            accessories,
            size,
            glowIntensity: parseFloat(glowIntensity),
            createdAt: new Date().toISOString()
        };

        this.saveAvatarToStorage();
        this.updateAvatarDisplay();
        this.showNotification('Avatar created successfully!');
    }

    /**
     * Update avatar display
     */
    updateAvatarDisplay() {
        const avatarDisplay = document.getElementById('userAvatarDisplay');
        if (avatarDisplay && this.userAvatar) {
            avatarDisplay.innerHTML = this.renderAvatarVisual(this.userAvatar);
        }
    }

    /**
     * Update avatar state based on conversation
     */
    updateAvatarState(conversationState) {
        this.avatarState.cognitiveLoad = conversationState.interestLevel || 0.5;
        
        // Update mood based on conversation tone
        if (conversationState.emotionalTone) {
            this.avatarState.mood = conversationState.emotionalTone.toLowerCase();
        }

        // Update energy based on engagement
        this.avatarState.energy = conversationState.confidenceLevel || 0.5;

        // Update expression based on mood
        this.updateAvatarExpression();
        
        // Update visual representation
        this.updateAvatarVisuals();
    }

    /**
     * Update avatar expression
     */
    updateAvatarExpression() {
        const moodExpressions = {
            neutral: 'neutral',
            curious: 'interested',
            excited: 'happy',
            contemplative: 'thoughtful',
            playful: 'cheerful',
            serious: 'focused'
        };
        
        this.avatarState.expression = moodExpressions[this.avatarState.mood] || 'neutral';
    }

    /**
     * Update avatar visuals based on state
     */
    updateAvatarVisuals() {
        if (!this.userAvatar) return;

        // Adjust glow based on energy
        const adjustedGlow = this.userAvatar.glowIntensity * (0.5 + this.avatarState.energy * 0.5);
        
        // Update avatar display with state-based modifications
        const avatarDisplay = document.getElementById('userAvatarDisplay');
        if (avatarDisplay) {
            const visual = avatarDisplay.querySelector('.avatar-humanoid, .avatar-energy, .avatar-crystalline, .avatar-mechanical');
            if (visual) {
                visual.style.boxShadow = `0 0 ${adjustedGlow * 30}px ${this.getColorHex(this.userAvatar.color)}`;
            }
        }
    }

    /**
     * Avatar-to-avatar interaction
     */
    interactWithStarFlame(action) {
        const interactions = {
            wave: { animation: 'wave', duration: 1000 },
            nod: { animation: 'nod', duration: 500 },
            think: { animation: 'think', duration: 2000 },
            celebrate: { animation: 'celebrate', duration: 1500 }
        };

        const interaction = interactions[action];
        if (interaction) {
            this.playAvatarAnimation(interaction.animation, interaction.duration);
        }
    }

    /**
     * Play avatar animation
     */
    playAvatarAnimation(animation, duration) {
        const avatarDisplay = document.getElementById('userAvatarDisplay');
        if (!avatarDisplay) return;

        avatarDisplay.classList.add(`animate-${animation}`);
        
        setTimeout(() => {
            avatarDisplay.classList.remove(`animate-${animation}`);
        }, duration);
    }

    /**
     * Execute avatar action command
     */
    executeAction(command) {
        const actions = {
            'wave': () => this.interactWithStarFlame('wave'),
            'nod': () => this.interactWithStarFlame('nod'),
            'think': () => this.interactWithStarFlame('think'),
            'celebrate': () => this.interactWithStarFlame('celebrate'),
            'change-color': (color) => this.changeAvatarColor(color),
            'change-size': (size) => this.changeAvatarSize(size),
            'add-accessory': (accessory) => this.addAccessory(accessory)
        };

        const [actionName, ...params] = command.split(':');
        const action = actions[actionName];

        if (action) {
            action(...params);
        }
    }

    /**
     * Change avatar color
     */
    changeAvatarColor(color) {
        if (this.userAvatar && this.customizationOptions.colorScheme.includes(color)) {
            this.userAvatar.color = color;
            this.saveAvatarToStorage();
            this.updateAvatarDisplay();
        }
    }

    /**
     * Change avatar size
     */
    changeAvatarSize(size) {
        if (this.userAvatar && ['small', 'medium', 'large'].includes(size)) {
            this.userAvatar.size = size;
            this.saveAvatarToStorage();
            this.updateAvatarDisplay();
        }
    }

    /**
     * Add accessory
     */
    addAccessory(accessory) {
        if (this.userAvatar && this.customizationOptions.accessories.includes(accessory)) {
            this.userAvatar.accessories = accessory;
            this.saveAvatarToStorage();
            this.updateAvatarDisplay();
        }
    }

    /**
     * Show notification
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'avatar-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for conversation updates
        document.addEventListener('conversationUpdate', (e) => {
            this.updateAvatarState(e.detail);
        });

        // Listen for avatar commands
        document.addEventListener('avatarCommand', (e) => {
            this.executeAction(e.detail.command);
        });
    }
}

// Initialize avatar system
const avatarSystem = new AvatarSystem();

// Make available globally
window.avatarSystem = avatarSystem;