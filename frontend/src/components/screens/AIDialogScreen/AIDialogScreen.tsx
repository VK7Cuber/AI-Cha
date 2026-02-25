import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import { completeDialog, sendDialogMessage, startDialog } from '../../../services/dialogService';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { useDialogWs } from '../../../hooks/useDialogWs';
import speakingStateLottie from '../../../Lottie/speaking.json';
import listeningStateLottie from '../../../Lottie/listening.json';
import thinkingStateLottie from '../../../Lottie/thinking.json';
import styles from './AIDialogScreen.module.css';

const STATES = ['listening', 'thinking', 'speaking'] as const;
type DialogState = typeof STATES[number];

const DEFAULT_TERMINAL_ID = import.meta.env.VITE_TERMINAL_ID || 'terminal-1';

export default function AIDialogScreen() {
  const navigate = useNavigate();
  const [dialogState, setDialogState] = useState<DialogState>('thinking');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [aiText, setAiText] = useState('Подготавливаю диалог...');
  const [aiTextSecondary, setAiTextSecondary] = useState('准备开始对话...');
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'idle'>('idle');
  const [pendingTranscript, setPendingTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');
  const [audioUnlocked, setAudioUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('ai-cha-audio-unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [isSending, setIsSending] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const ttsTimeoutRef = useRef<number | null>(null);
  const autoNavigateRef = useRef(false);
  const processingRef = useRef(false);
  const audioPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lastTranscriptRef = useRef('');
  const ignoreTranscriptRef = useRef(false);
  const ttsInFlightRef = useRef(false);
  const ttsRequestIdRef = useRef(0);
  const activeTtsIdRef = useRef(0);
  const didStartRef = useRef(false);
  const pendingTtsRef = useRef('');
  const sendTtsRef = useRef<(text: string) => void>(() => {});
  const pendingAudioRef = useRef<{ id: number; blob: Blob; receivedAt: number } | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const transitionToListening = () => {
    clearTimer();
    timeoutRef.current = window.setTimeout(() => {
      setDialogState('listening');
    }, 700);
  };

  const clearTtsTimer = () => {
    if (ttsTimeoutRef.current) {
      window.clearTimeout(ttsTimeoutRef.current);
      ttsTimeoutRef.current = null;
    }
  };

  const armTtsTimeout = useCallback(
    (timeoutMs = 15000) => {
      clearTtsTimer();
      ttsTimeoutRef.current = window.setTimeout(() => {
        ttsInFlightRef.current = false;
        pendingAudioRef.current = null;
        setError('TTS не ответил вовремя. Попробуйте ещё раз.');
        transitionToListening();
      }, timeoutMs);
    },
    []
  );

  const beginTtsRequest = useCallback(() => {
    const nextId = ttsRequestIdRef.current + 1;
    ttsRequestIdRef.current = nextId;
    activeTtsIdRef.current = nextId;
    pendingAudioRef.current = null;
    ttsInFlightRef.current = true;
    setDialogState('speaking');
    armTtsTimeout(20000);
  }, [armTtsTimeout]);

  const playAudioBlob = useCallback(
    (blob: Blob, ttsId = activeTtsIdRef.current) => {
      const playViaHtmlAudio = () => {
        const audioUrl = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.setAttribute('playsinline', 'true');
        audioRef.current = audio;
        ttsInFlightRef.current = false;
        audioPlayingRef.current = true;
        setDialogState('speaking');

        if (!audio.canPlayType(blob.type)) {
          setError('Браузер не поддерживает формат TTS. Попробуйте TTS_FORMAT=mp3.');
        }

        audio.onended = () => {
          audioPlayingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          if (pendingTtsRef.current) {
            const nextText = pendingTtsRef.current;
            pendingTtsRef.current = '';
            beginTtsRequest();
            sendTtsRef.current(nextText);
            return;
          }
          if (status === 'completed' && sessionId && !autoNavigateRef.current) {
            autoNavigateRef.current = true;
            navigate(`/ai-recipe?sessionId=${sessionId}&autoGenerate=1`);
            return;
          }
          if (status !== 'completed') {
            transitionToListening();
          }
        };

        audio.play().catch(() => {
          audioPlayingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          setError('Не удалось воспроизвести аудио. Нажмите "Включить звук".');
          pendingAudioRef.current = { id: ttsId, blob, receivedAt: Date.now() };
          transitionToListening();
        });
      };

      const run = async () => {
        clearTtsTimer();
        if (!blob || blob.size < 16) {
          setError('TTS вернул пустой аудиофайл. Проверьте формат TTS.');
          transitionToListening();
          return;
        }
        if (ttsId !== activeTtsIdRef.current) return;

        const AudioCtx =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) {
          playViaHtmlAudio();
          return;
        }

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }

        let ctx = audioContextRef.current;
        if (!ctx) {
          ctx = new AudioCtx();
          audioContextRef.current = ctx;
        }
        if (ctx.state === 'suspended') {
          try {
            await ctx.resume();
          } catch {
            // ignore resume errors
          }
        }

        let audioBuffer = null;
        try {
          const arrayBuffer = await blob.arrayBuffer();
          if (ttsId !== activeTtsIdRef.current) return;
          audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        } catch {
          playViaHtmlAudio();
          return;
        }

        if (!audioBuffer) {
          playViaHtmlAudio();
          return;
        }

        if (audioSourceRef.current) {
          try {
            audioSourceRef.current.stop();
          } catch {
            // ignore stop errors
          }
          audioSourceRef.current.disconnect();
          audioSourceRef.current = null;
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        audioSourceRef.current = source;
        ttsInFlightRef.current = false;
        audioPlayingRef.current = true;
        setDialogState('speaking');

        source.onended = () => {
          audioPlayingRef.current = false;
          audioSourceRef.current = null;
          if (pendingTtsRef.current) {
            const nextText = pendingTtsRef.current;
            pendingTtsRef.current = '';
            beginTtsRequest();
            sendTtsRef.current(nextText);
            return;
          }
          if (status === 'completed' && sessionId && !autoNavigateRef.current) {
            autoNavigateRef.current = true;
            navigate(`/ai-recipe?sessionId=${sessionId}&autoGenerate=1`);
            return;
          }
          if (status !== 'completed') {
            transitionToListening();
          }
        };

        source.start(0);
      };

      void run();
    },
    [beginTtsRequest, navigate, sessionId, status]
  );

  const handleWsStatus = useCallback(
    (state: string) => {
      if (status === 'completed') return;
      if (audioPlayingRef.current || ttsInFlightRef.current || pendingAudioRef.current) return;
      if (state === 'listening' || state === 'thinking') {
        setDialogState(state);
      }
    },
    [status]
  );

  const handleTranscript = useCallback((text: string) => {
    if (!text.trim()) return;
    if (ignoreTranscriptRef.current) return;
    if (text === lastTranscriptRef.current) return;
    lastTranscriptRef.current = text;
    setPendingTranscript(text);
  }, []);

  const handleTtsComplete = useCallback(
    (blob: Blob) => {
      clearTtsTimer();
      ttsInFlightRef.current = false;
      if (!audioUnlocked) {
        pendingAudioRef.current = { id: activeTtsIdRef.current, blob, receivedAt: Date.now() };
        setError('Нажмите "Включить звук", чтобы разрешить воспроизведение.');
        return;
      }
      playAudioBlob(blob, activeTtsIdRef.current);
    },
    [audioUnlocked, playAudioBlob]
  );

  const { isOpen: wsReady, sendAudioChunk, sendFinalize, sendTts } = useDialogWs(sessionId, {
    onStatus: handleWsStatus,
    onTranscript: handleTranscript,
    onTtsStart: () => {
      ttsInFlightRef.current = true;
      setDialogState('speaking');
      armTtsTimeout(15000);
    },
    onTtsComplete: handleTtsComplete,
    onError: (message) => {
      const normalized = String(message || '');
      const ignored = [
        'STT stream timeout',
        'TTS is busy',
        'fetch failed',
        'STT stream ended',
        'STT stream closed before final result',
        'STT finalize timeout'
      ];
      if (ignored.some((entry) => normalized.includes(entry))) {
        console.warn('[ws]', normalized);
        return;
      }
      if (/\btts\b/i.test(normalized)) {
        ttsInFlightRef.current = false;
        pendingTtsRef.current = '';
        clearTtsTimer();
      }
      setError(normalized);
      if (status !== 'completed' && !audioPlayingRef.current) {
        setDialogState('listening');
      }
    }
  });

  useEffect(() => {
    sendTtsRef.current = sendTts;
  }, [beginTtsRequest, sendTts]);

  const { start, stop, isRecording, error: micError } = useAudioRecorder({
    onChunk: sendAudioChunk,
    onLevel: setAudioLevel,
    noiseGate: {
      enabled: true,
      minRms: 0.004,
      ratio: 2.8,
      hangoverMs: 220,
      floorSmoothing: 0.05
    }
  });

  const startSession = useCallback(async () => {
    setDialogState('thinking');
    setError('');
    clearTtsTimer();
    ttsInFlightRef.current = false;
    pendingTtsRef.current = '';
    pendingAudioRef.current = null;
    ttsRequestIdRef.current = 0;
    activeTtsIdRef.current = 0;
    audioPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {
        // ignore stop errors
      }
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    try {
      const response = await startDialog(DEFAULT_TERMINAL_ID);
      setSessionId(response.sessionId);
      setAiText(response.message || 'Здравствуйте! Готов продолжить диалог.');
      setAiTextSecondary('欢迎！让我们继续对话。');
      setStatus(response.status === 'completed' ? 'completed' : 'in_progress');
      setQuestionIndex(1);
      if (response.message) {
        if (ttsInFlightRef.current || audioPlayingRef.current) {
          pendingTtsRef.current = response.message;
        } else {
          beginTtsRequest();
          sendTts(response.message);
        }
      } else {
        transitionToListening();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запуска диалога');
      setDialogState('listening');
    }
  }, [beginTtsRequest, sendTts]);

  useEffect(() => {
    if (didStartRef.current) return;
    didStartRef.current = true;
    startSession();
    return () => clearTimer();
  }, [startSession]);

  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('ai-cha-dialog-session-id', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (status === 'completed' && sessionId && !autoNavigateRef.current && !audioPlayingRef.current) {
      const timer = window.setTimeout(() => {
        if (!autoNavigateRef.current) {
          autoNavigateRef.current = true;
          navigate(`/ai-recipe?sessionId=${sessionId}&autoGenerate=1`);
        }
      }, 2000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [navigate, sessionId, status]);

  useEffect(() => {
    if (dialogState === 'listening' && status === 'in_progress' && wsReady && !micError) {
      start();
      return;
    }
    if (isRecording) {
      stop();
    }
  }, [dialogState, isRecording, micError, start, status, stop, wsReady]);

  useEffect(() => {
    if (micError) {
      setError(micError);
    }
  }, [micError]);

  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    setAudioUnlocked(true);
    setError('');
    try {
      sessionStorage.setItem('ai-cha-audio-unlocked', 'true');
    } catch {
      // ignore storage errors
    }
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume().catch(() => {});
      }
    }
    if (pendingAudioRef.current) {
      const pending = pendingAudioRef.current;
      pendingAudioRef.current = null;
      playAudioBlob(pending.blob, pending.id);
    }
  }, [audioUnlocked, playAudioBlob]);

  const handleUnlockAudio = () => {
    unlockAudio();
  };

  useEffect(() => {
    if (audioUnlocked) return;
    const handleFirstInteraction = () => {
      unlockAudio();
    };
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audioUnlocked, unlockAudio]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!sessionId || isSending || status !== 'in_progress') return;
      setIsSending(true);
      setDialogState('thinking');
      setError('');
      try {
        const response = await sendDialogMessage(sessionId, text);
        setAiText(response.message || 'Спасибо! Продолжаем.');
        setAiTextSecondary('谢谢！我们继续。');
        setStatus(response.status === 'completed' ? 'completed' : 'in_progress');
        if (response.status === 'in_progress') {
          setQuestionIndex((prev) => Math.min(prev + 1, 7));
        }
      if (response.message) {
        if (ttsInFlightRef.current || audioPlayingRef.current) {
          pendingTtsRef.current = response.message;
        } else {
          beginTtsRequest();
          sendTts(response.message);
        }
      } else if (response.status !== 'completed') {
        transitionToListening();
      }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка отправки сообщения');
        setDialogState('listening');
      } finally {
        setIsSending(false);
      }
    },
    [beginTtsRequest, isSending, sendTts, sessionId, status]
  );

  useEffect(() => {
    if (!pendingTranscript || processingRef.current) return;
    processingRef.current = true;
    setPendingTranscript('');
    sendMessage(pendingTranscript)
      .catch(() => null)
      .finally(() => {
        processingRef.current = false;
      });
  }, [pendingTranscript, sendMessage]);

  const handleSkip = () => {
    ignoreTranscriptRef.current = true;
    sendFinalize();
    stop();
    sendMessage('Пропустить вопрос').finally(() => {
      ignoreTranscriptRef.current = false;
    });
  };
  const handleRepeat = () => {
    ignoreTranscriptRef.current = true;
    sendFinalize();
    stop();
    sendMessage('Не расслышал, повторите пожалуйста').finally(() => {
      ignoreTranscriptRef.current = false;
    });
  };

  const handleStop = async () => {
    if (!sessionId || isSending) return;
    setIsSending(true);
    setDialogState('thinking');
    try {
      sendFinalize();
      stop();
      clearTtsTimer();
      await completeDialog(sessionId);
      setStatus('completed');
      setAiText('Спасибо! Диалог завершён.');
      setAiTextSecondary('谢谢！对话已结束。');
      if (ttsInFlightRef.current || audioPlayingRef.current) {
        pendingTtsRef.current = 'Спасибо! Диалог завершён.';
      } else {
        beginTtsRequest();
        sendTts('Спасибо! Диалог завершён.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка завершения диалога');
      setDialogState('listening');
    } finally {
      setIsSending(false);
    }
  };

  const stateLabel = useMemo(() => {
    if (status === 'completed') return 'Диалог завершён';
    if (dialogState === 'thinking') return 'AI обдумывает ответ';
    if (dialogState === 'speaking') return 'AI говорит';
    return 'Слушаю ответ';
  }, [dialogState, status]);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>

      <div className={styles.center}>
        {dialogState === 'listening' && (
          <Lottie animationData={listeningStateLottie} loop autoplay className="h-80 w-80 max-[1100px]:h-64 max-[1100px]:w-64" />
        )}
        {dialogState === 'speaking' && (
          <Lottie animationData={speakingStateLottie} loop autoplay className="h-80 w-80 max-[1100px]:h-64 max-[1100px]:w-64" />
        )}
        {dialogState === 'thinking' && (
          <Lottie animationData={thinkingStateLottie} loop autoplay className="h-80 w-80 max-[1100px]:h-64 max-[1100px]:w-64" />
        )}
        <div className={styles.stateHint}>{stateLabel}</div>

        <div className={styles.indicatorRow}>
          {dialogState === 'listening' && status === 'in_progress' && <div className={styles.recordDot} />}
          <div className={styles.levelStub}>Уровень звука: {Math.round(audioLevel * 100)}</div>
          <div className={styles.progress}>Вопрос {questionIndex} из 7</div>
        </div>
      </div>

      <div className={styles.textArea}>
        <div className={styles.aiText}>{aiText}</div>
        <div className={styles.aiTextSecondary}>{aiTextSecondary}</div>
        <div className={styles.statusBadge}>
          WS: {wsReady ? 'подключен' : 'подключение...'}
        </div>
        {status === 'completed' && <div className={styles.statusBadge}>Диалог завершён</div>}
        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleSkip}
            disabled={isSending || status !== 'in_progress'}
          >
            Пропустить
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleRepeat}
            disabled={isSending || status !== 'in_progress'}
          >
            Не услышал
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonStop}`}
            onClick={handleStop}
            disabled={isSending || status === 'completed'}
          >
            Стоп
          </button>
          {!audioUnlocked && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleUnlockAudio}
            >
              Включить звук
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
