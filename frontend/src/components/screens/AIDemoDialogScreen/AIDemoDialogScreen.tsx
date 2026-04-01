/**
 * Offline demo dialog screen.
 *
 * Visually identical to AIDialogScreen, but operates without internet:
 *  • Plays pre-recorded MP3 files from /public/demo/
 *  • Uses the client-side VAD (mic + silence detection) to advance steps
 *  • Never calls the backend API or WebSocket
 *  • After the last answer navigates to /ai-recipe?demo=1 with a pre-built recipe
 *
 * Audio files must be generated once (requires internet) via:
 *   cd backend && npm run demo:generate-audio
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { DEMO_STEPS, DEMO_QUESTION_COUNT } from '../../../data/demoData';
import speakingStateLottie from '../../../Lottie/speaking.json';
import listeningStateLottie from '../../../Lottie/listening.json';
import thinkingStateLottie from '../../../Lottie/thinking.json';
import styles from '../AIDialogScreen/AIDialogScreen.module.css';
import demoStyles from './AIDemoDialogScreen.module.css';

type DialogState = 'listening' | 'thinking' | 'speaking';

export default function AIDemoDialogScreen() {
  const navigate = useNavigate();

  const [dialogState, setDialogState] = useState<DialogState>('thinking');
  const [demoStep, setDemoStep] = useState(0);
  const [aiText, setAiText] = useState('Подготавливаю демонстрацию...');
  const [aiTextSecondary, setAiTextSecondary] = useState('准备演示...');
  const [audioLevel, setAudioLevel] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayingRef = useRef(false);
  const demoStepRef = useRef(0);
  const advancingRef = useRef(false); // prevents double-advance
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clientVadRef = useRef({
    hasSpeech: false,
    lastVoiceAt: 0,
    listeningStartedAt: 0,
    finalizeSent: false,
    lastLevelAt: 0,
    speechMs: 0,
  });

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const navigateToRecipe = useCallback(() => {
    navigate('/ai-recipe?demo=1');
  }, [navigate]);

  // ─── Audio playback ──────────────────────────────────────────────────────────

  const playDemoAudio = useCallback(
    (stepIndex: number) => {
      const step = DEMO_STEPS[stepIndex];
      if (!step) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setAiText(step.question);
      setAiTextSecondary(step.questionZh || '');
      setDialogState('speaking');
      audioPlayingRef.current = true;

      const audio = new Audio(step.audioFile);
      audioRef.current = audio;

      const onFinished = () => {
        audioPlayingRef.current = false;
        audioRef.current = null;
        if (step.isClosing) {
          timerRef.current = setTimeout(navigateToRecipe, 600);
        } else {
          // Slight delay then transition to listening
          timerRef.current = setTimeout(() => setDialogState('listening'), 700);
        }
      };

      audio.onended = onFinished;
      audio.onerror = () => {
        // Audio file missing — still advance so demo doesn't freeze
        console.warn(`[demo] audio file not found: ${step.audioFile}`);
        audioPlayingRef.current = false;
        audioRef.current = null;
        if (step.isClosing) {
          timerRef.current = setTimeout(navigateToRecipe, 800);
        } else {
          timerRef.current = setTimeout(() => setDialogState('listening'), 700);
        }
      };

      audio.play().catch(() => {
        audioPlayingRef.current = false;
        audioRef.current = null;
        if (step.isClosing) {
          timerRef.current = setTimeout(navigateToRecipe, 800);
        } else {
          timerRef.current = setTimeout(() => setDialogState('listening'), 700);
        }
      });
    },
    [navigateToRecipe],
  );

  // ─── Step advancement ────────────────────────────────────────────────────────

  const advanceDemoStep = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    clearTimer();

    // Stop mic immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      audioPlayingRef.current = false;
    }

    const currentStep = demoStepRef.current;
    const nextStep = currentStep + 1;

    setDialogState('thinking');

    if (nextStep >= DEMO_STEPS.length) {
      timerRef.current = setTimeout(navigateToRecipe, 800);
      return;
    }

    demoStepRef.current = nextStep;
    setDemoStep(nextStep);

    // Brief "thinking" pause, then play next audio
    timerRef.current = setTimeout(() => {
      advancingRef.current = false;
      playDemoAudio(nextStep);
    }, 800);
  }, [navigateToRecipe, playDemoAudio]);

  // ─── Startup ─────────────────────────────────────────────────────────────────
  // We use a local `cancelled` flag instead of a persistent ref guard so that
  // React StrictMode's intentional unmount→remount cycle works correctly:
  // the cleanup cancels the first (phantom) timer, the second mount creates a
  // new timer and `playDemoAudio` fires exactly once.

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) playDemoAudio(0);
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [playDemoAudio]);

  // ─── Reset VAD on each listening cycle ──────────────────────────────────────

  useEffect(() => {
    if (dialogState !== 'listening') return;
    advancingRef.current = false;
    clientVadRef.current = {
      hasSpeech: false,
      lastVoiceAt: 0,
      listeningStartedAt: Date.now(),
      finalizeSent: false,
      lastLevelAt: Date.now(),
      speechMs: 0,
    };
  }, [dialogState]);

  // ─── Client VAD ──────────────────────────────────────────────────────────────
  // Same thresholds as AIDialogScreen — detects speech then silence → advances.

  useEffect(() => {
    if (dialogState !== 'listening') return;
    if (audioPlayingRef.current) return;

    const now = Date.now();
    const VOICE_THRESHOLD = 0.03;
    const SILENCE_TO_FINALIZE_MS = 900;
    const MAX_UTTERANCE_MS = 12000;
    const MIN_SPEECH_MS = 350;
    const MIN_LISTEN_BEFORE_FINALIZE_MS = 700;

    const vad = clientVadRef.current;
    const deltaMs = Math.max(0, now - (vad.lastLevelAt || now));
    vad.lastLevelAt = now;

    if (audioLevel >= VOICE_THRESHOLD) {
      vad.hasSpeech = true;
      vad.lastVoiceAt = now;
      vad.speechMs += Math.min(deltaMs, 400);
      return;
    }

    if (!vad.hasSpeech || vad.finalizeSent) return;
    if (vad.speechMs < MIN_SPEECH_MS) return;

    const silentForMs = now - vad.lastVoiceAt;
    const sinceListeningMs = now - vad.listeningStartedAt;

    if (sinceListeningMs < MIN_LISTEN_BEFORE_FINALIZE_MS) return;
    if (silentForMs < SILENCE_TO_FINALIZE_MS && sinceListeningMs < MAX_UTTERANCE_MS) return;

    vad.finalizeSent = true;
    setDialogState('thinking');
    timerRef.current = setTimeout(() => advanceDemoStep(), 300);
  }, [audioLevel, advanceDemoStep, dialogState]);

  // ─── Microphone ──────────────────────────────────────────────────────────────
  // Mic runs during listening to show the level bar and enable VAD.
  // Audio chunks are discarded (no STT needed).

  const { start, stop, isRecording, error: micError } = useAudioRecorder({
    onChunk: () => {}, // intentionally discard
    onLevel: setAudioLevel,
    noiseGate: {
      enabled: true,
      minRms: 0.004,
      ratio: 2.8,
      hangoverMs: 220,
      floorSmoothing: 0.05,
    },
  });

  useEffect(() => {
    if (dialogState === 'listening') {
      start();
      return;
    }
    if (isRecording) stop();
  }, [dialogState, isRecording, start, stop]);

  // ─── Button handlers ─────────────────────────────────────────────────────────

  const handleSkip = () => {
    if (advancingRef.current) return;
    advanceDemoStep();
  };

  const handleStop = () => {
    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    navigate('/ai-instruction');
  };

  // ─── Derived state ───────────────────────────────────────────────────────────

  const questionIndex = demoStep + 1;
  const isListening = dialogState === 'listening';

  const stateLabel = useMemo(() => {
    if (dialogState === 'thinking') return 'AI обдумывает ответ';
    if (dialogState === 'speaking') return 'AI говорит';
    return 'Слушаю ответ';
  }, [dialogState]);

  // ─── Render ──────────────────────────────────────────────────────────────────

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
          {isListening && <div className={styles.recordDot} />}
          <div className={styles.levelStub}>Уровень звука: {Math.round(audioLevel * 100)}</div>
          <div className={styles.progress}>
            Вопрос {Math.min(questionIndex, DEMO_QUESTION_COUNT)} из {DEMO_QUESTION_COUNT}
          </div>
        </div>
      </div>

      <div className={styles.textArea}>
        <div className={styles.aiText}>{aiText}</div>
        {aiTextSecondary && (
          <div className={styles.aiTextSecondary}>{aiTextSecondary}</div>
        )}
        <div className={`${styles.statusBadge} ${demoStyles.demoBadge}`}>Демонстрация</div>
        {micError && <div className={styles.errorText}>{micError}</div>}

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleSkip}
            disabled={dialogState === 'thinking'}
          >
            Пропустить
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonStop}`}
            onClick={handleStop}
          >
            Стоп
          </button>
        </div>
      </div>
    </div>
  );
}
