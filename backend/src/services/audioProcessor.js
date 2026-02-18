import { sttConfig } from '../config/sttConfig.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function computeRms(int16Samples) {
  if (!int16Samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < int16Samples.length; i += 1) {
    const sample = int16Samples[i] / 32768;
    sum += sample * sample;
  }
  return Math.sqrt(sum / int16Samples.length);
}

function downmixToMono(int16Samples, channels) {
  if (channels === 1) return int16Samples;
  const monoLength = Math.floor(int16Samples.length / channels);
  const mono = new Int16Array(monoLength);
  for (let i = 0; i < monoLength; i += 1) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch += 1) {
      sum += int16Samples[i * channels + ch];
    }
    mono[i] = Math.round(sum / channels);
  }
  return mono;
}

function resampleLinear(int16Samples, inputRate, targetRate) {
  if (inputRate === targetRate) return int16Samples;
  const ratio = targetRate / inputRate;
  const targetLength = Math.floor(int16Samples.length * ratio);
  const output = new Int16Array(targetLength);
  for (let i = 0; i < targetLength; i += 1) {
    const srcIndex = i / ratio;
    const left = Math.floor(srcIndex);
    const right = Math.min(left + 1, int16Samples.length - 1);
    const frac = srcIndex - left;
    const sample = int16Samples[left] * (1 - frac) + int16Samples[right] * frac;
    output[i] = Math.round(sample);
  }
  return output;
}

function normalizeVolume(int16Samples, targetRms = 0.1, maxGain = 10) {
  const rms = computeRms(int16Samples);
  if (rms === 0) return int16Samples;
  const gain = clamp(targetRms / rms, 0.1, maxGain);
  if (gain === 1) return int16Samples;
  const output = new Int16Array(int16Samples.length);
  for (let i = 0; i < int16Samples.length; i += 1) {
    output[i] = clamp(Math.round(int16Samples[i] * gain), -32768, 32767);
  }
  return output;
}

function alignPcmBuffer(buffer) {
  if (!buffer || buffer.length < 2) return buffer;
  const offsetAligned = buffer.byteOffset % 2 === 0;
  const evenLength = buffer.length % 2 === 0;
  if (offsetAligned && evenLength) return buffer;
  const alignedLength = buffer.length - (buffer.length % 2);
  const aligned = Buffer.allocUnsafe(alignedLength);
  buffer.copy(aligned, 0, 0, alignedLength);
  return aligned;
}

export class AudioProcessor {
  constructor(options = {}) {
    this.inputFormat = options.inputFormat || sttConfig.input.format;
    this.inputSampleRate = options.inputSampleRate || sttConfig.input.sampleRateHz;
    this.inputChannels = options.inputChannels || sttConfig.input.channels;
    this.targetSampleRate = options.targetSampleRate || sttConfig.recognition.sampleRateHz;
    this.vadConfig = options.vadConfig || sttConfig.vad;
    this.totalMs = 0;
    this.lastSpeechMs = null;
    this.speechMs = 0;
  }

  reset() {
    this.totalMs = 0;
    this.lastSpeechMs = null;
    this.speechMs = 0;
  }

  processPcmChunk(buffer) {
    const alignedBuffer = alignPcmBuffer(buffer);
    let int16Samples = new Int16Array(
      alignedBuffer.buffer,
      alignedBuffer.byteOffset,
      Math.floor(alignedBuffer.length / 2)
    );
    int16Samples = downmixToMono(int16Samples, this.inputChannels);
    int16Samples = resampleLinear(int16Samples, this.inputSampleRate, this.targetSampleRate);
    int16Samples = normalizeVolume(int16Samples);

    const rms = computeRms(int16Samples);
    const durationMs = Math.floor((int16Samples.length / this.targetSampleRate) * 1000);
    this.totalMs += durationMs;

    let isSpeech = false;
    if (this.vadConfig?.enabled) {
      if (rms >= this.vadConfig.volumeThreshold) {
        isSpeech = true;
        this.lastSpeechMs = this.totalMs;
        this.speechMs += durationMs;
      }
    }

    let shouldFinalize = false;
    let silenceMs = null;
    if (this.vadConfig?.enabled) {
      silenceMs = this.lastSpeechMs === null ? this.totalMs : this.totalMs - this.lastSpeechMs;
      if (this.speechMs >= this.vadConfig.minSpeechMs && silenceMs >= this.vadConfig.silenceMs) {
        shouldFinalize = true;
      }
      if (this.speechMs >= this.vadConfig.maxSpeechMs) {
        shouldFinalize = true;
      }
    }

    return {
      buffer: Buffer.from(int16Samples.buffer, int16Samples.byteOffset, int16Samples.byteLength),
      rms,
      isSpeech,
      shouldFinalize,
      durationMs,
      silenceMs,
      speechMs: this.speechMs,
      totalMs: this.totalMs
    };
  }

  processChunk(buffer) {
    if (this.inputFormat !== 'pcm16') {
      return {
        buffer,
        rms: null,
        isSpeech: false,
        shouldFinalize: false,
      durationMs: 0,
      silenceMs: null,
      speechMs: 0,
      totalMs: 0
      };
    }

    return this.processPcmChunk(buffer);
  }
}
