import { useCallback, useEffect, useRef, useState } from 'react';

interface AudioRecorderOptions {
  onChunk: (chunk: ArrayBuffer) => void;
  onLevel?: (level: number) => void;
  targetSampleRate?: number;
  bufferSize?: number;
  noiseGate?: {
    enabled?: boolean;
    minRms?: number;
    ratio?: number;
    hangoverMs?: number;
    floorSmoothing?: number;
  };
}

function downsampleBuffer(buffer: Float32Array, inputRate: number, targetRate: number) {
  if (inputRate === targetRate) return buffer;
  const ratio = inputRate / targetRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i += 1) {
    const origin = i * ratio;
    const left = Math.floor(origin);
    const right = Math.min(left + 1, buffer.length - 1);
    const weight = origin - left;
    result[i] = buffer[left] * (1 - weight) + buffer[right] * weight;
  }
  return result;
}

function floatTo16BitPCM(buffer: Float32Array) {
  const out = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i += 1) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function computeRms(buffer: Float32Array) {
  if (!buffer.length) return 0;
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

export function useAudioRecorder(options: AudioRecorderOptions) {
  const { onChunk, onLevel, targetSampleRate = 16000, bufferSize = 4096, noiseGate } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingRef = useRef(false);
  const noiseStateRef = useRef({ floor: 0.004, lastSpeechAt: 0 });

  const stop = useCallback(() => {
    setIsRecording(false);
    recordingRef.current = false;
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    if (isRecording) return;
    setError('');
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('Браузер не поддерживает доступ к микрофону');
        return;
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1
          }
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      sourceRef.current = source;
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        if (!recordingRef.current) return;
        const input = event.inputBuffer.getChannelData(0);
        const downsampled = downsampleBuffer(input, audioContext.sampleRate, targetSampleRate);
        const rms = computeRms(downsampled);
        const gateEnabled = noiseGate && noiseGate.enabled !== false;
        if (gateEnabled) {
          const now = performance.now();
          const minRms = Math.max(0.0001, noiseGate?.minRms ?? 0.004);
          const ratio = Math.max(1.5, noiseGate?.ratio ?? 2.8);
          const hangoverMs = Math.max(80, noiseGate?.hangoverMs ?? 220);
          const smoothing = Math.min(0.2, Math.max(0.005, noiseGate?.floorSmoothing ?? 0.05));
          const currentFloor = Math.max(minRms, noiseStateRef.current.floor);
          const threshold = Math.max(minRms, currentFloor * ratio);
          const isSpeech = rms >= threshold;
          if (isSpeech) {
            noiseStateRef.current.lastSpeechAt = now;
          } else {
            noiseStateRef.current.floor = Math.max(
              minRms,
              currentFloor * (1 - smoothing) + rms * smoothing
            );
          }
          const withinHangover = now - noiseStateRef.current.lastSpeechAt <= hangoverMs;
          if (!isSpeech && !withinHangover) {
            for (let i = 0; i < downsampled.length; i += 1) {
              downsampled[i] = 0;
            }
          }
        }
        if (onLevel) onLevel(rms);
        const pcm16 = floatTo16BitPCM(downsampled);
        onChunk(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);
      recordingRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка доступа к микрофону');
      stop();
    }
  }, [bufferSize, isRecording, noiseGate, onChunk, onLevel, stop, targetSampleRate]);

  useEffect(() => () => stop(), [stop]);

  return {
    start,
    stop,
    isRecording,
    error
  };
}
