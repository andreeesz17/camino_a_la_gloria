// Sistema de Sonido Realista de Fútbol mediante Web Audio API (Sintetizado)
class SoundSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ambientNode = null;
        this.ambientGain = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopAmbient();
        } else {
            this.startAmbient();
        }
        return this.muted;
    }

    // Cántico/Rumor constante del estadio
    startAmbient() {
        if (this.muted) return;
        this.init();
        if (this.ambientNode) return; // Ya está sonando

        const ctx = this.ctx;
        const bufferSize = ctx.sampleRate * 4; // 4 segundos de bucle
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Ruido rosa/marrón para ambiente más cálido y grave (murmullo)
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Filtro paso bajo simple para simular murmullo lejano de multitudes
            data[i] = (lastOut + (0.08 * white)) / 1.08;
            lastOut = data[i];
            data[i] *= 2.5; // Amplificar un poco
        }

        this.ambientNode = ctx.createBufferSource();
        this.ambientNode.buffer = buffer;
        this.ambientNode.loop = true;

        this.ambientGain = ctx.createGain();
        // Filtro pasabanda para simular acústica de estadio abierto
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);

        this.ambientNode.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(ctx.destination);

        this.ambientGain.gain.setValueAtTime(0.08, ctx.currentTime);
        this.ambientNode.start(0);
    }

    stopAmbient() {
        if (this.ambientNode) {
            try {
                this.ambientNode.stop();
            } catch (e) {}
            this.ambientNode = null;
            this.ambientGain = null;
        }
    }

    // Desvanecimiento progresivo del audio ambiente al abandonar o finalizar el partido
    fadeOutAmbient(duration = 1.0) {
        if (this.muted) {
            this.stopAmbient();
            return;
        }
        this.init();
        const ctx = this.ctx;
        if (this.ambientGain && ctx) {
            const now = ctx.currentTime;
            const currentGain = this.ambientGain.gain.value;
            this.ambientGain.gain.cancelScheduledValues(now);
            this.ambientGain.gain.setValueAtTime(currentGain, now);
            this.ambientGain.gain.linearRampToValueAtTime(0.0, now + duration);
            
            // Detener el nodo de audio y limpiar recursos una vez que el volumen llegue a 0
            const nodeToStop = this.ambientNode;
            setTimeout(() => {
                if (this.ambientNode === nodeToStop) {
                    this.stopAmbient();
                }
            }, duration * 1000 + 50);
        } else {
            this.stopAmbient();
        }
    }

    // Silbato realista del árbitro (Tono metálico doble con vibrato)
    playWhistle() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const blow = (timeOffset, duration) => {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';

            // Dos frecuencias cercanas crean el efecto de interferencia "brillante" del silbato
            osc1.frequency.setValueAtTime(1350, now + timeOffset);
            osc2.frequency.setValueAtTime(1385, now + timeOffset);

            // Modulación de vibrato rápido (frecuencia vibrando)
            const modulator = ctx.createOscillator();
            const modulatorGain = ctx.createGain();
            modulator.frequency.value = 45; // Hz de vibración
            modulatorGain.gain.value = 15;  // Intensidad

            modulator.connect(modulatorGain);
            modulatorGain.connect(osc1.frequency);
            modulatorGain.connect(osc2.frequency);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0.12, now + timeOffset + 0.02);
            gain.gain.setValueAtTime(0.12, now + timeOffset + duration - 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + duration);

            modulator.start(now + timeOffset);
            osc1.start(now + timeOffset);
            osc2.start(now + timeOffset);

            modulator.stop(now + timeOffset + duration);
            osc1.stop(now + timeOffset + duration);
            osc2.stop(now + timeOffset + duration);
        };

        // Patrón de silbato: corto-corto-largo para gol/inicio
        blow(0, 0.12);
        blow(0.18, 0.12);
        blow(0.36, 0.45);
    }

    // Silbato final simple de 2 toques largos
    playFinalWhistle() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const blow = (timeOffset, duration) => {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(1300, now + timeOffset);
            osc2.frequency.setValueAtTime(1335, now + timeOffset);

            const modulator = ctx.createOscillator();
            const modulatorGain = ctx.createGain();
            modulator.frequency.value = 40;
            modulatorGain.gain.value = 12;

            modulator.connect(modulatorGain);
            modulatorGain.connect(osc1.frequency);
            modulatorGain.connect(osc2.frequency);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0.12, now + timeOffset + 0.03);
            gain.gain.setValueAtTime(0.12, now + timeOffset + duration - 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + duration);

            modulator.start(now + timeOffset);
            osc1.start(now + timeOffset);
            osc2.start(now + timeOffset);

            modulator.stop(now + timeOffset + duration);
            osc1.stop(now + timeOffset + duration);
            osc2.stop(now + timeOffset + duration);
        };

        blow(0, 0.35);
        blow(0.45, 0.65);
    }

    // Sonido sordo del golpe al balón de fútbol (Thud)
    playKick() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        // Pitch bajo cayendo rápido para dar la sensación de cuero pesado golpeado
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    playPowerKick() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        gain.gain.setValueAtTime(0.95, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.21);

        // Agrega un soplido rápido de ruido blanco para simular la fricción violenta del aire
        const noise = this.createNoiseNode(0.08);
        if (noise) {
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);

            noise.node.connect(filter);
            filter.connect(noise.gainNode);
            noise.gainNode.connect(ctx.destination);

            noise.gainNode.gain.setValueAtTime(0.25, now);
            noise.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            noise.node.start(now);
            noise.node.stop(now + 0.11);
        }
    }

    // Sonido de red sacudida (Fricción de piola con ruido blanco filtrado)
    playNetSwish() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const noise = this.createNoiseNode(0.35);
        if (!noise) return;

        // Filtro de barrido para imitar el "shhh-rustle" del balón estirando las mallas del arco
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(180, now + 0.35);
        filter.Q.setValueAtTime(1.2, now);

        noise.node.connect(filter);
        filter.connect(noise.gainNode);
        noise.gainNode.connect(ctx.destination);

        noise.gainNode.gain.setValueAtTime(0.5, now);
        noise.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.node.start(now);
        noise.node.stop(now + 0.41);
    }

    // Rebote metálico en el poste (Clink!)
    playBounce() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Tono de advertencia periódico para los últimos segundos (Beep!)
    playWarningBeep() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        if (!ctx) return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // Nota brillante A5

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    // Celebración de gol (Gran silbatazo, impacto de red y estruendo del estadio)
    playGoal() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        this.playWhistle();
        setTimeout(() => this.playNetSwish(), 60);

        // Subida rápida de la ganancia del cántico ambiental por euforia
        if (this.ambientGain) {
            const currentGain = this.ambientGain.gain.value;
            this.ambientGain.gain.cancelScheduledValues(now);
            this.ambientGain.gain.setValueAtTime(currentGain, now);
            this.ambientGain.gain.linearRampToValueAtTime(0.55, now + 0.25); // Rugido de la tribuna
            this.ambientGain.gain.exponentialRampToValueAtTime(0.08, now + 3.0); // Retorna a la normalidad
        }
    }

    createNoiseNode(duration) {
        try {
            if (!this.ctx) return null;
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const node = this.ctx.createBufferSource();
            node.buffer = buffer;
            const gainNode = this.ctx.createGain();
            return { node, gainNode };
        } catch (e) {
            return null;
        }
    }
}

const sounds = new SoundSystem();
window.sounds = sounds;
