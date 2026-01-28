
export function decodeBase64(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64.replace(/\s/g, ''));
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Erreur de décodage Base64:", e);
    return new Uint8Array(0);
  }
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const numSamples = Math.floor(data.byteLength / 2);
  const alignedBuffer = new ArrayBuffer(numSamples * 2);
  const uint8View = new Uint8Array(alignedBuffer);
  uint8View.set(data.subarray(0, numSamples * 2));
  
  const dataInt16 = new Int16Array(alignedBuffer);
  const frameCount = dataInt16.length / numChannels;
  
  if (frameCount === 0) {
    return ctx.createBuffer(numChannels, 1, sampleRate);
  }

  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let sharedAudioContext: AudioContext | null = null;

/**
 * Initialise ou reprend le contexte audio. 
 * DOIT être appelé dans le gestionnaire d'événement de clic direct.
 */
export async function initAudioContext(): Promise<AudioContext> {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (sharedAudioContext.state === 'suspended') {
    await sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

export async function playRawAudio(base64Audio: string): Promise<void> {
  const ctx = await initAudioContext();

  try {
    const audioData = decodeBase64(base64Audio);
    if (audioData.length === 0) return;

    const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1.2; // Petit boost pour les environnements de travail bruyants
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    return new Promise((resolve) => {
      source.onended = () => resolve();
      source.start(0);
    });
  } catch (e) {
    console.error("Échec de la lecture audio PCM:", e);
  }
}
