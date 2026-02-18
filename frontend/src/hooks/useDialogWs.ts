import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type StatusState = 'listening' | 'thinking' | 'speaking' | string;

interface DialogWsHandlers {
  onStatus?: (state: StatusState) => void;
  onPartial?: (text: string) => void;
  onTranscript?: (text: string, confidence?: number | null) => void;
  onTtsStart?: (meta: { contentType?: string; format?: string; cacheHit?: boolean }) => void;
  onTtsComplete?: (blob: Blob) => void;
  onError?: (message: string) => void;
}

function resolveWsUrl(sessionId: string) {
  const raw = (import.meta.env.VITE_WS_AUDIO_URL || '').trim();
  if (raw) {
    if (raw.includes('{sessionId}')) {
      return raw.replace('{sessionId}', sessionId);
    }
    return `${raw.replace(/\/+$/, '')}/ws/audio/${sessionId}`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname;
  return `${protocol}://${host}:8081/ws/audio/${sessionId}`;
}

export function useDialogWs(sessionId: string | null, handlers: DialogWsHandlers) {
  const wsRef = useRef<WebSocket | null>(null);
  const ttsChunksRef = useRef<(ArrayBuffer | Blob)[]>([]);
  const ttsContentTypeRef = useRef<string>('audio/ogg');
  const ttsReceivingRef = useRef(false);
  const pendingJsonRef = useRef<Record<string, unknown>[]>([]);
  const handlersRef = useRef(handlers);
  const [isOpen, setIsOpen] = useState(false);

  const wsUrl = useMemo(() => (sessionId ? resolveWsUrl(sessionId) : null), [sessionId]);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!wsUrl) return;

    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setIsOpen(true);
      if (pendingJsonRef.current.length) {
        pendingJsonRef.current.forEach((payload) => {
          ws.send(JSON.stringify(payload));
        });
        pendingJsonRef.current = [];
      }
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.event) {
            case 'status':
              handlersRef.current.onStatus?.(msg.payload?.state);
              break;
            case 'partial':
              handlersRef.current.onPartial?.(msg.payload?.text || '');
              break;
            case 'transcript':
              handlersRef.current.onTranscript?.(msg.payload?.text || '', msg.payload?.confidence ?? null);
              break;
            case 'tts_start':
              ttsReceivingRef.current = true;
              ttsChunksRef.current = [];
              const rawContentType = msg.payload?.contentType || 'audio/ogg';
              const format = String(msg.payload?.format || '').toLowerCase();
              ttsContentTypeRef.current =
                format === 'mp3' && rawContentType === 'audio/mp3'
                  ? 'audio/mpeg'
                  : rawContentType;
              handlersRef.current.onTtsStart?.(msg.payload || {});
              break;
            case 'tts_end': {
              ttsReceivingRef.current = false;
              const blob = new Blob(ttsChunksRef.current, { type: ttsContentTypeRef.current });
              handlersRef.current.onTtsComplete?.(blob);
              ttsChunksRef.current = [];
              break;
            }
            case 'tts_error':
              ttsReceivingRef.current = false;
              ttsChunksRef.current = [];
              handlersRef.current.onError?.(msg.payload?.message || msg.message || 'WS error');
              break;
            case 'error':
              handlersRef.current.onError?.(msg.payload?.message || msg.message || 'WS error');
              break;
            default:
              break;
          }
        } catch (err) {
          handlersRef.current.onError?.('Ошибка разбора WS сообщения');
        }
        return;
      }

      if (!ttsReceivingRef.current) return;
      if (event.data instanceof ArrayBuffer) {
        ttsChunksRef.current.push(event.data);
        return;
      }
      if (event.data instanceof Blob) {
        ttsChunksRef.current.push(event.data);
      }
    };

    ws.onerror = () => {
      setIsOpen(false);
      handlersRef.current.onError?.('WebSocket соединение недоступно');
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setIsOpen(false);
    };
  }, [wsUrl]);

  const sendJson = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return;
    }
    pendingJsonRef.current.push(payload);
  }, []);

  const sendAudioChunk = useCallback((chunk: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(chunk);
    }
  }, []);

  const sendFinalize = useCallback(() => {
    sendJson({ event: 'finalize' });
  }, [sendJson]);

  const sendTts = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendJson({ event: 'tts', payload: { text } });
    },
    [sendJson]
  );

  return {
    isOpen,
    sendAudioChunk,
    sendFinalize,
    sendTts
  };
}
