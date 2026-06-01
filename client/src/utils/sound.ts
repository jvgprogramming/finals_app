let sharedAudioContext: AudioContext | null = null;
let lastPlayedAt = 0;

/** Play a short chime; throttled and reuses one AudioContext to avoid device errors. */
export function playSuccessSound() {
  const now = Date.now();
  if (now - lastPlayedAt < 3000) return;
  lastPlayedAt = now;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioCtx();
    }
    const ctx = sharedAudioContext;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.start();
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Browser may block or fail audio hardware — ignore
  }
}
