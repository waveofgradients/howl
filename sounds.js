// Brutalist Electronic Sound System
// Uses Web Audio API for synthesized sounds

class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not supported:', e);
        }
    }
    
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    // Brutalist click sound - short percussive
    playClick() {
        if (!this.initialized) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.value = 800;
        
        filter.type = 'highpass';
        filter.frequency.value = 600;
        
        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialDecayTo = 0.001;
        gain.gain.setTargetAtTime(0.001, this.audioContext.currentTime, 0.02);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
    }
    
    // Start recording sound - ascending blip
    playRecordStart() {
        if (!this.initialized) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.001, this.audioContext.currentTime + 0.08, 0.02);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    // Stop recording sound - descending blip
    playRecordStop() {
        if (!this.initialized) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.001, this.audioContext.currentTime + 0.08, 0.02);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    // Success sound - bright ascending chord
    playSuccess() {
        if (!this.initialized) return;
        this.resume();
        
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        const now = this.audioContext.currentTime;
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.05;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.setTargetAtTime(0.001, startTime + 0.15, 0.1);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }
    
    // Perfect score sound - epic triumphant fanfare
    playPerfect() {
        if (!this.initialized) return;
        this.resume();
        
        const now = this.audioContext.currentTime;
        
        // Chord progression: C major -> G major -> C major (octave up)
        const chords = [
            { freqs: [261.63, 329.63, 392.00], time: 0 },     // C4 chord
            { freqs: [392.00, 493.88, 587.33], time: 0.2 },   // G4 chord  
            { freqs: [523.25, 659.25, 783.99], time: 0.4 },   // C5 chord
        ];
        
        chords.forEach(chord => {
            chord.freqs.forEach(freq => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                osc.type = 'sawtooth';
                osc.frequency.value = freq;
                
                filter.type = 'lowpass';
                filter.frequency.value = 2000;
                
                const startTime = now + chord.time;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.15, startTime + 0.03);
                gain.gain.setTargetAtTime(0.001, startTime + 0.3, 0.15);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);
                
                osc.start(startTime);
                osc.stop(startTime + 0.6);
            });
        });
        
        // Add a deep bass hit
        const bassOsc = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(80, now);
        bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        
        bassGain.gain.setValueAtTime(0.4, now);
        bassGain.gain.setTargetAtTime(0.001, now + 0.2, 0.1);
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        
        bassOsc.start(now);
        bassOsc.stop(now + 0.5);
    }
    
    // Error/try again sound - low buzz
    playError() {
        if (!this.initialized) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.001, this.audioContext.currentTime + 0.1, 0.03);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }
    
    // Level up sound - rising arpeggio
    playLevelUp() {
        if (!this.initialized) return;
        this.resume();
        
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        const now = this.audioContext.currentTime;
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.06;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
            gain.gain.setTargetAtTime(0.001, startTime + 0.08, 0.03);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }
    
    // Next word sound - soft tick
    playNext() {
        if (!this.initialized) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 600;
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.001, this.audioContext.currentTime, 0.03);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
    }
    
    // Explosion particles sound
    playExplosion() {
        if (!this.initialized) return;
        this.resume();
        
        const now = this.audioContext.currentTime;
        
        // White noise burst
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        noiseFilter.Q.value = 1;
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 0.3);
        
        // Impact thud
        const thud = this.audioContext.createOscillator();
        const thudGain = this.audioContext.createGain();
        
        thud.type = 'sine';
        thud.frequency.setValueAtTime(150, now);
        thud.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        
        thudGain.gain.setValueAtTime(0.5, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        thud.connect(thudGain);
        thudGain.connect(this.masterGain);
        
        thud.start(now);
        thud.stop(now + 0.25);
    }
}

// Export sound engine
window.SoundEngine = SoundEngine;

