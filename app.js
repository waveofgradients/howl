// HOWL - Pronunciation Practice App
// Main Application Logic

class HowlApp {
    constructor() {
        // State
        this.currentChallenge = null;
        this.isRecording = false;
        this.recognition = null;
        this.level = 1;
        this.streak = 0;
        this.perfectsToday = 0;
        this.attemptsToday = 0;
        
        // Theme
        this.themes = ['theme-blue', 'theme-green', 'theme-brown'];
        this.currentTheme = 'theme-blue';
        
        // Sound engine
        this.sound = new SoundEngine();
        
        // ElevenLabs config
        this.elevenLabsKey = localStorage.getItem('elevenLabsKey') || '';
        this.voiceId = localStorage.getItem('voiceId') || '21m00Tcm4TlvDq8ikWAM';
        
        // Checker particles for explosion
        this.checkerSquares = { top: [], bottom: [] };
        
        // DOM elements
        this.elements = {};
        
        // Initialize
        this.init();
    }
    
    async init() {
        await this.sound.init();
        this.cacheElements();
        this.setupTheme();
        this.loadProgress();
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.drawCheckers();
        this.loadNewChallenge();
    }
    
    cacheElements() {
        this.elements = {
            app: document.getElementById('app'),
            targetWord: document.getElementById('targetWord'),
            recordBtn: document.getElementById('recordBtn'),
            listenBtn: document.getElementById('listenBtn'),
            feedback: document.getElementById('feedback'),
            transcript: document.getElementById('transcript'),
            progressRing: document.getElementById('progressRing'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            scoreValue: document.getElementById('scoreValue'),
            nextBtn: document.getElementById('nextBtn'),
            levelNum: document.getElementById('levelNum'),
            streakNum: document.getElementById('streakNum'),
            checkerTop: document.getElementById('checkerCanvasTop'),
            checkerBottom: document.getElementById('checkerCanvasBottom'),
            particlesContainer: document.getElementById('particlesContainer'),
            settingsToggle: document.getElementById('settingsToggle'),
            settingsPanel: document.getElementById('settingsPanel'),
            elevenLabsKeyInput: document.getElementById('elevenLabsKey'),
            voiceSelect: document.getElementById('voiceSelect'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            micIcon: document.getElementById('micIcon'),
            recordingPulse: document.getElementById('recordingPulse')
        };
        
        // Set saved settings
        this.elements.elevenLabsKeyInput.value = this.elevenLabsKey;
        this.elements.voiceSelect.value = this.voiceId;
    }
    
    setupTheme() {
        // Get today's date and use it to pick a theme
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const themeIndex = dayOfYear % this.themes.length;
        this.currentTheme = this.themes[themeIndex];
        
        // Apply theme
        this.elements.app.className = this.currentTheme;
        
        // Update theme-color meta tag
        const themeColors = {
            'theme-blue': '#2B4A78',
            'theme-green': '#3D7A4A',
            'theme-brown': '#5D2E2A'
        };
        document.querySelector('meta[name="theme-color"]').content = themeColors[this.currentTheme];
    }
    
    loadProgress() {
        const saved = localStorage.getItem('howlProgress');
        if (saved) {
            const data = JSON.parse(saved);
            const today = new Date().toDateString();
            
            if (data.lastDate === today) {
                this.level = data.level || 1;
                this.streak = data.streak || 0;
                this.perfectsToday = data.perfectsToday || 0;
                this.attemptsToday = data.attemptsToday || 0;
            } else {
                // New day - potentially level up based on yesterday's performance
                if (data.perfectsToday >= 5) {
                    this.level = Math.min((data.level || 1) + 1, 10);
                }
                this.streak = 0;
                this.perfectsToday = 0;
                this.attemptsToday = 0;
            }
        }
        
        this.updateLevelDisplay();
    }
    
    saveProgress() {
        const data = {
            level: this.level,
            streak: this.streak,
            perfectsToday: this.perfectsToday,
            attemptsToday: this.attemptsToday,
            lastDate: new Date().toDateString()
        };
        localStorage.setItem('howlProgress', JSON.stringify(data));
    }
    
    updateLevelDisplay() {
        this.elements.levelNum.textContent = this.level;
        this.elements.streakNum.textContent = this.streak;
    }
    
    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            this.elements.feedback.textContent = 'SPEECH NOT SUPPORTED';
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            this.elements.recordBtn.classList.add('recording');
            this.elements.feedback.textContent = 'LISTENING...';
            this.elements.transcript.textContent = '';
            this.sound.playRecordStart();
        };
        
        this.recognition.onresult = (event) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            
            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.trim();
                this.elements.transcript.textContent = `"${transcript}"`;
                this.evaluatePronunciation(transcript);
            } else {
                // Show interim results
                const interim = lastResult[0].transcript.trim();
                this.elements.transcript.textContent = `"${interim}..."`;
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
            
            if (event.error === 'no-speech') {
                this.elements.feedback.textContent = 'NO SPEECH DETECTED';
            } else if (event.error === 'not-allowed') {
                this.elements.feedback.textContent = 'MIC ACCESS DENIED';
            } else {
                this.elements.feedback.textContent = 'TRY AGAIN';
            }
            
            this.sound.playError();
        };
        
        this.recognition.onend = () => {
            this.stopRecording();
        };
    }
    
    setupEventListeners() {
        // Record button
        this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        
        // Listen button (ElevenLabs pronunciation)
        this.elements.listenBtn.addEventListener('click', () => this.playPronunciation());
        
        // Next button
        this.elements.nextBtn.addEventListener('click', () => this.loadNewChallenge());
        
        // Settings
        this.elements.settingsToggle.addEventListener('click', () => {
            this.elements.settingsPanel.classList.toggle('open');
            this.sound.playClick();
        });
        
        this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.settingsPanel.contains(e.target) && 
                !this.elements.settingsToggle.contains(e.target) &&
                this.elements.settingsPanel.classList.contains('open')) {
                this.elements.settingsPanel.classList.remove('open');
            }
        });
        
        // Handle visibility change (pause/resume audio context)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.sound.resume();
            }
        });
        
        // Handle resize for checker patterns
        window.addEventListener('resize', () => this.drawCheckers());
    }
    
    toggleRecording() {
        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in this browser. Try Chrome or Safari.');
            return;
        }
        
        // Reset UI
        this.elements.scoreDisplay.classList.remove('visible');
        this.elements.nextBtn.style.display = 'none';
        this.setProgress(0);
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.elements.recordBtn.classList.remove('recording');
        this.sound.playRecordStop();
    }
    
    loadNewChallenge() {
        this.sound.playNext();
        
        // Get random challenge for current level
        this.currentChallenge = getRandomChallenge(this.level);
        
        // Update UI
        this.elements.targetWord.textContent = this.currentChallenge.text;
        this.elements.targetWord.classList.add('pulse');
        setTimeout(() => this.elements.targetWord.classList.remove('pulse'), 300);
        
        this.elements.feedback.textContent = 'TAP TO SPEAK';
        this.elements.transcript.textContent = '';
        this.elements.scoreDisplay.classList.remove('visible');
        this.elements.nextBtn.style.display = 'none';
        this.setProgress(0);
    }
    
    evaluatePronunciation(transcript) {
        const target = this.currentChallenge.text.toLowerCase();
        const spoken = transcript.toLowerCase();
        
        // Calculate similarity score
        const score = this.calculateSimilarity(target, spoken);
        const percentage = Math.round(score * 100);
        
        this.attemptsToday++;
        
        // Update UI
        this.setProgress(score);
        this.elements.scoreValue.textContent = `${percentage}%`;
        this.elements.scoreDisplay.classList.add('visible');
        
        // Determine feedback
        if (percentage >= 95) {
            this.handlePerfectScore();
        } else if (percentage >= 80) {
            this.handleGoodScore();
        } else if (percentage >= 60) {
            this.handleOkayScore();
        } else {
            this.handleLowScore();
        }
        
        this.saveProgress();
    }
    
    calculateSimilarity(target, spoken) {
        // Normalize strings
        const t = target.replace(/[^a-z0-9\s]/gi, '').toLowerCase();
        const s = spoken.replace(/[^a-z0-9\s]/gi, '').toLowerCase();
        
        if (t === s) return 1;
        
        // Levenshtein distance
        const matrix = [];
        
        for (let i = 0; i <= s.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= t.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= s.length; i++) {
            for (let j = 1; j <= t.length; j++) {
                if (s.charAt(i - 1) === t.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        const distance = matrix[s.length][t.length];
        const maxLength = Math.max(t.length, s.length);
        
        return 1 - (distance / maxLength);
    }
    
    handlePerfectScore() {
        this.elements.feedback.textContent = 'PERFECT!';
        this.elements.feedback.classList.add('success');
        setTimeout(() => this.elements.feedback.classList.remove('success'), 500);
        
        this.streak++;
        this.perfectsToday++;
        this.updateLevelDisplay();
        
        // Play perfect sound and trigger explosion
        this.sound.playPerfect();
        setTimeout(() => {
            this.sound.playExplosion();
            this.triggerExplosion();
        }, 400);
        
        this.elements.nextBtn.style.display = 'block';
        
        // Level up check
        if (this.perfectsToday >= 5 && this.level < 10) {
            setTimeout(() => {
                this.level++;
                this.updateLevelDisplay();
                this.sound.playLevelUp();
                this.elements.feedback.textContent = 'LEVEL UP!';
            }, 1500);
        }
    }
    
    handleGoodScore() {
        this.elements.feedback.textContent = 'GOOOOD';
        this.elements.feedback.classList.add('success');
        setTimeout(() => this.elements.feedback.classList.remove('success'), 500);
        
        this.streak++;
        this.updateLevelDisplay();
        this.sound.playSuccess();
        
        this.elements.nextBtn.style.display = 'block';
    }
    
    handleOkayScore() {
        this.elements.feedback.textContent = 'CLOSE...';
        this.streak = 0;
        this.updateLevelDisplay();
        this.sound.playClick();
        
        this.elements.nextBtn.style.display = 'block';
    }
    
    handleLowScore() {
        this.elements.feedback.textContent = 'TRY AGAIN';
        this.elements.feedback.classList.add('error');
        setTimeout(() => this.elements.feedback.classList.remove('error'), 500);
        
        this.streak = 0;
        this.updateLevelDisplay();
        this.sound.playError();
    }
    
    setProgress(value) {
        // Progress ring has circumference of 534 (2 * PI * 85)
        const circumference = 534;
        const offset = circumference - (value * circumference);
        this.elements.progressRing.style.strokeDashoffset = offset;
    }
    
    // ElevenLabs Text-to-Speech
    async playPronunciation() {
        if (!this.elevenLabsKey) {
            // Fallback to browser TTS
            this.playBrowserTTS();
            return;
        }
        
        this.elements.listenBtn.disabled = true;
        this.sound.playClick();
        
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenLabsKey
                },
                body: JSON.stringify({
                    text: this.currentChallenge.text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error('ElevenLabs API error');
            }
            
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.elements.listenBtn.disabled = false;
            };
            
            audio.play();
        } catch (error) {
            console.error('ElevenLabs error:', error);
            // Fallback to browser TTS
            this.playBrowserTTS();
            this.elements.listenBtn.disabled = false;
        }
    }
    
    playBrowserTTS() {
        const utterance = new SpeechSynthesisUtterance(this.currentChallenge.text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        
        // Try to find an American English voice
        const voices = speechSynthesis.getVoices();
        const americanVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha')) ||
                             voices.find(v => v.lang === 'en-US') ||
                             voices[0];
        
        if (americanVoice) {
            utterance.voice = americanVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
    
    saveSettings() {
        this.elevenLabsKey = this.elements.elevenLabsKeyInput.value;
        this.voiceId = this.elements.voiceSelect.value;
        
        localStorage.setItem('elevenLabsKey', this.elevenLabsKey);
        localStorage.setItem('voiceId', this.voiceId);
        
        this.elements.settingsPanel.classList.remove('open');
        this.sound.playSuccess();
    }
    
    // Checker pattern drawing
    drawCheckers() {
        this.drawCheckerCanvas(this.elements.checkerTop, 'top');
        this.drawCheckerCanvas(this.elements.checkerBottom, 'bottom');
    }
    
    drawCheckerCanvas(canvas, position) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const squareSize = 24;
        const cols = Math.ceil(rect.width / squareSize) + 1;
        const rows = Math.ceil(rect.height / squareSize) + 1;
        
        // Get accent color from CSS
        const style = getComputedStyle(this.elements.app);
        const accentColor = style.getPropertyValue('--accent-color').trim();
        
        // Store squares for explosion
        this.checkerSquares[position] = [];
        
        // Create diagonal checker pattern
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * squareSize;
                const y = row * squareSize;
                
                // Create diagonal pattern with varying density
                let shouldDraw = false;
                
                if (position === 'top') {
                    // More squares at top-left, fewer toward bottom-right
                    const diagonalThreshold = (col + row);
                    shouldDraw = (col + row) % 2 === 0 && diagonalThreshold < (cols + rows) * 0.6;
                } else {
                    // More squares at bottom-right, fewer toward top-left
                    const diagonalThreshold = (cols - col) + (rows - row);
                    shouldDraw = (col + row) % 2 === 0 && diagonalThreshold < (cols + rows) * 0.6;
                }
                
                if (shouldDraw) {
                    ctx.fillStyle = accentColor;
                    ctx.fillRect(x, y, squareSize - 1, squareSize - 1);
                    
                    // Store for explosion
                    this.checkerSquares[position].push({
                        x: x + rect.left,
                        y: y + rect.top,
                        size: squareSize - 1
                    });
                }
            }
        }
    }
    
    // Explosion animation
    triggerExplosion() {
        const container = this.elements.particlesContainer;
        const style = getComputedStyle(this.elements.app);
        const accentColor = style.getPropertyValue('--accent-color').trim();
        
        // Create particles from checker squares
        const allSquares = [...this.checkerSquares.top, ...this.checkerSquares.bottom];
        
        allSquares.forEach((square, index) => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                left: ${square.x}px;
                top: ${square.y}px;
                width: ${square.size}px;
                height: ${square.size}px;
                background: ${accentColor};
            `;
            
            container.appendChild(particle);
            
            // Animate with random direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = 200 + Math.random() * 400;
            const rotationSpeed = (Math.random() - 0.5) * 720;
            
            const targetX = Math.cos(angle) * velocity;
            const targetY = Math.sin(angle) * velocity + 300; // Add gravity
            
            particle.animate([
                { 
                    transform: 'translate(0, 0) rotate(0deg) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${targetX}px, ${targetY}px) rotate(${rotationSpeed}deg) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                delay: index * 2
            }).onfinish = () => particle.remove();
        });
        
        // Flash effect
        const flash = document.createElement('div');
        flash.className = 'flash-overlay active';
        flash.style.background = accentColor;
        this.elements.app.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
        
        // Redraw checkers after explosion settles
        setTimeout(() => this.drawCheckers(), 1500);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HowlApp();
});

// Load voices for browser TTS fallback
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
    };
}

