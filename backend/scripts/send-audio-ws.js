import fs from 'fs';
import WebSocket from 'ws';

const filePath = process.argv[2];
const defaultWsPort = Number(process.env.WS_AUDIO_PORT || process.env.WS_PORT || 8081);
const wsUrl = process.argv[3] || `ws://localhost:${defaultWsPort}/ws/audio/test-session`;

if (!filePath) {
  console.error('Usage: node scripts/send-audio-ws.js <path-to-pcm16-file> [ws-url]');
  process.exit(1);
}

const sampleRate = Number(process.env.STT_INPUT_SAMPLE_RATE || 16000);
const chunkMs = Number(process.env.CHUNK_MS || 100);
const bytesPerSample = 2;
const chunkSize = Math.floor((sampleRate * bytesPerSample * chunkMs) / 1000);

const audioBuffer = fs.readFileSync(filePath);
let offset = 0;

const perMessageDeflate = process.env.WS_PERMESSAGE_DEFLATE !== 'false';
const forceNoExtensions = process.env.WS_FORCE_NO_EXTENSIONS === 'true';
const headers = forceNoExtensions ? { 'Sec-WebSocket-Extensions': '' } : undefined;
const useGlobal = process.env.WS_USE_GLOBAL === 'true';
const WebSocketImpl = useGlobal ? globalThis.WebSocket : WebSocket;
const ws = new WebSocketImpl(wsUrl, useGlobal ? undefined : { perMessageDeflate, headers });

const onEvent = (event, handler) => {
  if (typeof ws.on === 'function') {
    ws.on(event, handler);
    return;
  }
  ws.addEventListener(event, (evt) => handler(evt?.data ?? evt));
};

onEvent('open', () => {
  console.log(`Connected to ${wsUrl}`);
  console.log('Extensions:', ws.extensions);
  if (process.env.WS_IDLE_ONLY === 'true') {
    if (process.env.WS_NO_CLOSE === 'true') {
      return;
    }
    if (process.env.WS_TERMINATE === 'true') {
      setTimeout(() => ws.terminate(), 1000);
      return;
    }
    setTimeout(() => ws.close(), 1000);
    return;
  }
  if (process.env.WS_TEXT_ONLY === 'true') {
    ws.send(JSON.stringify({ event: 'ping', payload: { ok: true } }), {
      compress: perMessageDeflate
    });
    setTimeout(() => ws.close(), 300);
    return;
  }

  if (process.env.WS_SEND_SMALL_BINARY === 'true') {
    ws.send(Buffer.from([1, 2, 3, 4]), { binary: true, compress: perMessageDeflate });
    setTimeout(() => ws.close(), 300);
    return;
  }

  if (process.env.WS_SEND_TEXT_FIRST === 'true') {
    ws.send(JSON.stringify({ event: 'hello', payload: { ok: true } }), {
      compress: perMessageDeflate
    });
    setTimeout(() => startStreaming(), 200);
    return;
  }

  startStreaming();
});

function startStreaming() {
  const interval = setInterval(() => {
    if (offset >= audioBuffer.length) {
      clearInterval(interval);
      ws.send(JSON.stringify({ event: 'finalize' }), { compress: perMessageDeflate });
      return;
    }

    const chunk = audioBuffer.subarray(offset, offset + chunkSize);
    ws.send(chunk, { binary: true, compress: perMessageDeflate });
    offset += chunkSize;
  }, chunkMs);
}

onEvent('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (msg.event === 'transcript') {
      console.log('Transcript:', msg.payload?.text || msg.text);
    } else if (msg.event === 'partial') {
      console.log('Partial:', msg.payload?.text || msg.text);
    } else if (msg.event === 'error') {
      console.error('Error:', msg.payload?.message || msg.message);
    } else {
      console.log('Message:', msg);
    }
  } catch {
    console.log('Binary message received');
  }
});

if (typeof ws.on === 'function') {
  ws.on('unexpected-response', (_req, res) => {
    console.error('Unexpected response:', res.statusCode, res.statusMessage);
  });
}

onEvent('error', (error) => {
  console.error('WebSocket error:', error?.message || error);
});

onEvent('close', (code, reason) => {
  const reasonText = reason?.toString() || '';
  console.log(`Connection closed (code=${code}${reasonText ? `, reason=${reasonText}` : ''})`);
});
