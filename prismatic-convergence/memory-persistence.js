/**
 * Memory Persistence System
 * Database-backed long-term memory storage
 */

class MemoryPersistence {
    constructor() {
        this.dbName = 'PrismaticMemoryDB';
        this.dbVersion = 1;
        this.db = null;
        this.storeName = 'conversations';
        this.initialized = false;
    }

    /**
     * Initialize IndexedDB database
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Error opening database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.initialized = true;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create conversations store
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('userId', 'userId', { unique: false });
                    store.createIndex('sessionId', 'sessionId', { unique: false });
                }

                // Create user profile store
                if (!db.objectStoreNames.contains('userProfiles')) {
                    const profileStore = db.createObjectStore('userProfiles', { keyPath: 'userId' });
                    profileStore.createIndex('name', 'name', { unique: false });
                }

                // Create memory variables store
                if (!db.objectStoreNames.contains('memoryVariables')) {
                    const varStore = db.createObjectStore('memoryVariables', { keyPath: 'variableId' });
                    varStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Save conversation turn
     */
    async saveConversationTurn(conversationData) {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const record = {
                ...conversationData,
                timestamp: new Date().toISOString(),
                sessionId: this.getCurrentSessionId()
            };

            const request = store.add(record);

            request.onsuccess = () => {
                console.log('Conversation turn saved:', record);
                resolve(record);
            };

            request.onerror = () => {
                console.error('Error saving conversation turn:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get conversation history
     */
    async getConversationHistory(limit = 50) {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            
            const request = index.openCursor(null, 'prev');
            const results = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor && count < limit) {
                    results.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => {
                console.error('Error getting conversation history:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Save user profile
     */
    async saveUserProfile(profile) {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userProfiles'], 'readwrite');
            const store = transaction.objectStore('userProfiles');

            const record = {
                ...profile,
                updatedAt: new Date().toISOString()
            };

            const request = store.put(record);

            request.onsuccess = () => {
                console.log('User profile saved:', record);
                resolve(record);
            };

            request.onerror = () => {
                console.error('Error saving user profile:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId = 'default') {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userProfiles'], 'readonly');
            const store = transaction.objectStore('userProfiles');
            const request = store.get(userId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Error getting user profile:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Save memory variable
     */
    async saveMemoryVariable(variableId, value, metadata = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['memoryVariables'], 'readwrite');
            const store = transaction.objectStore('memoryVariables');

            const record = {
                variableId,
                value,
                metadata,
                timestamp: new Date().toISOString()
            };

            const request = store.put(record);

            request.onsuccess = () => {
                console.log('Memory variable saved:', record);
                resolve(record);
            };

            request.onerror = () => {
                console.error('Error saving memory variable:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get memory variable
     */
    async getMemoryVariable(variableId) {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['memoryVariables'], 'readonly');
            const store = transaction.objectStore('memoryVariables');
            const request = store.get(variableId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Error getting memory variable:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all memory variables
     */
    async getAllMemoryVariables() {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['memoryVariables'], 'readonly');
            const store = transaction.objectStore('memoryVariables');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('Error getting all memory variables:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Search conversations
     */
    async searchConversations(query) {
        if (!this.initialized) {
            await this.initialize();
        }

        const history = await this.getConversationHistory(1000);
        const lowerQuery = query.toLowerCase();

        return history.filter(record => {
            const content = JSON.stringify(record).toLowerCase();
            return content.includes(lowerQuery);
        });
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        if (!this.initialized) {
            await this.initialize();
        }

        const history = await this.getConversationHistory(10000);
        const variables = await this.getAllMemoryVariables();

        return {
            totalConversations: history.length,
            totalVariables: variables.length,
            activeVariables: variables.filter(v => v.value !== null && v.value !== '').length,
            firstConversation: history[history.length - 1]?.timestamp || null,
            lastConversation: history[0]?.timestamp || null
        };
    }

    /**
     * Export data
     */
    async exportData() {
        const history = await this.getConversationHistory(10000);
        const variables = await this.getAllMemoryVariables();
        const profile = await this.getUserProfile();

        return {
            conversations: history,
            memoryVariables: variables,
            userProfile: profile,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import data
     */
    async importData(data) {
        if (!this.initialized) {
            await this.initialize();
        }

        // Import conversations
        if (data.conversations) {
            for (const conv of data.conversations) {
                await this.saveConversationTurn(conv);
            }
        }

        // Import memory variables
        if (data.memoryVariables) {
            for (const variable of data.memoryVariables) {
                await this.saveMemoryVariable(variable.variableId, variable.value, variable.metadata);
            }
        }

        // Import user profile
        if (data.userProfile) {
            await this.saveUserProfile(data.userProfile);
        }

        console.log('Data imported successfully');
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName, 'userProfiles', 'memoryVariables'], 'readwrite');
            
            transaction.objectStore(this.storeName).clear();
            transaction.objectStore('userProfiles').clear();
            transaction.objectStore('memoryVariables').clear();

            transaction.oncomplete = () => {
                console.log('All data cleared');
                resolve();
            };

            transaction.onerror = () => {
                console.error('Error clearing data:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    /**
     * Get current session ID
     */
    getCurrentSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = Date.now().toString();
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    /**
     * Create analytics UI
     */
    createAnalyticsUI() {
        const analyticsContainer = document.createElement('div');
        analyticsContainer.className = 'analytics-panel';
        analyticsContainer.innerHTML = `
            <div class="analytics-section">
                <h4>Memory Analytics</h4>
                
                <div class="analytics-stats" id="analyticsStats">
                    <div class="stat-item">
                        <span class="stat-label">Total Conversations:</span>
                        <span class="stat-value" id="totalConversations">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Active Variables:</span>
                        <span class="stat-value" id="activeVariables">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">First Conversation:</span>
                        <span class="stat-value" id="firstConversation">-</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Last Conversation:</span>
                        <span class="stat-value" id="lastConversation">-</span>
                    </div>
                </div>

                <div class="analytics-actions">
                    <button onclick="memoryPersistence.refreshAnalytics()">Refresh</button>
                    <button onclick="memoryPersistence.exportToFile()">Export Data</button>
                    <button onclick="memoryPersistence.clearAllData()">Clear All Data</button>
                </div>
            </div>
        `;

        return analyticsContainer;
    }

    /**
     * Refresh analytics display
     */
    async refreshAnalytics() {
        const stats = await this.getStatistics();

        document.getElementById('totalConversations').textContent = stats.totalConversations;
        document.getElementById('activeVariables').textContent = stats.activeVariables;
        document.getElementById('firstConversation').textContent = stats.firstConversation 
            ? new Date(stats.firstConversation).toLocaleDateString() 
            : '-';
        document.getElementById('lastConversation').textContent = stats.lastConversation 
            ? new Date(stats.lastConversation).toLocaleDateString() 
            : '-';
    }

    /**
     * Export data to file
     */
    async exportToFile() {
        const data = await this.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `prismatic-memory-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize memory persistence
const memoryPersistence = new MemoryPersistence();

// Make available globally
window.memoryPersistence = memoryPersistence;