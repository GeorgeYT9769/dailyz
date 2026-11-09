/**
 * Lightweight, playful procedural Web Audio sound generator.
 * Zero external audio file assets needed, works offline, snappy, and battery-friendly.
 */

export type SoundEffect = 
  | 'pop' 
  | 'click' 
  | 'success' 
  | 'complete' 
  | 'levelUp' 
  | 'achievement' 
  | 'freeze' 
  | 'reroll' 
  | 'equip' 
  | 'plink';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public play(effect: SoundEffect, enabled: boolean = true) {
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    try {
      switch (effect) {
        case 'pop': {
          // Simple, soft subtle pop (35ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(720, now + 0.035);

          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'click': {
          // Minimalist tactile tick (20ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.025);
          break;
        }

        case 'plink': {
          // Delicate subtle glass tap (60ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1174.66, now); // D6

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        case 'complete': {
          // Simple, clean single chime note (A5, 160ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }

        case 'achievement': {
          // Simple, gentle two-note interval (E5 -> A5, 140ms total)
          const notes = [659.25, 880];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.065;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.11);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.12);
          });
          break;
        }

        case 'levelUp': {
          // Simple uplifting two-tone chime (F#5 -> B5)
          const freqs = [739.99, 987.77];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteStart = now + idx * 0.07;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.1, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.14);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + 0.15);
          });
          break;
        }

        case 'reroll': {
          // Subtle double click (two gentle ticks)
          [0, 0.045].forEach((offset) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + offset;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500, t);
            osc.frequency.exponentialRampToValueAtTime(320, t + 0.02);

            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.025);
          });
          break;
        }

        case 'freeze': {
          // Simple soft cool tap (100ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1318.51, now); // E6

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'equip': {
          // Clean soft snap
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.03);

          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'success':
        default: {
          // Gentle affirmative chime (G5, 120ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(783.99, now); // G5

          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }
      }
    } catch {
      // Audio failed or blocked silently
    }
  }
}

export const soundFx = new SoundManager();

export function playSound(effect: SoundEffect, enabled: boolean = true) {
  soundFx.play(effect, enabled);
}
