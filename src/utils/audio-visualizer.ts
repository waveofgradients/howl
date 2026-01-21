// Lightweight audio visualization - optimized for mobile

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let microphone: MediaStreamAudioSourceNode | null = null;
let stream: MediaStream | null = null;
// Reuse array to avoid GC
let dataArray: Uint8Array | null = null;

export async function startAudioVisualization(): Promise<void> {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 32; // Minimal for performance
  analyser.smoothingTimeConstant = 0.3;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  microphone = audioContext.createMediaStreamSource(stream);
  microphone.connect(analyser);
}

export function stopAudioVisualization(): void {
  if (microphone) microphone.disconnect();
  if (stream) stream.getTracks().forEach(track => track.stop());
  if (audioContext) audioContext.close();
  audioContext = null;
  analyser = null;
  microphone = null;
  stream = null;
  dataArray = null;
}

// Get 5 audio levels, reusing buffer
export function getAudioLevels(): number[] {
  if (!analyser || !dataArray) {
    return [0.3, 0.3, 0.3, 0.3, 0.3];
  }
  
  analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
  
  // Quick 5-bar calculation from 16 frequency bins
  const len = dataArray.length;
  const step = Math.floor(len / 5);
  
  return [
    Math.max(0.2, dataArray[0] / 200),
    Math.max(0.2, dataArray[step] / 200),
    Math.max(0.2, dataArray[step * 2] / 200),
    Math.max(0.2, dataArray[step * 3] / 200),
    Math.max(0.2, dataArray[step * 4] / 200),
  ];
}

// Not used anymore but kept for compatibility
export function subscribeToAudioLevels(callback: (levels: number[]) => void): () => void {
  let running = true;
  const tick = () => {
    if (!running) return;
    callback(getAudioLevels());
    requestAnimationFrame(tick);
  };
  tick();
  return () => { running = false; };
}
