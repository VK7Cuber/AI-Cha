import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import Button from '../../common/Button/Button';
import instructionLottie from '../../../Lottie/instruction.json';
import styles from './AIInstructionScreen.module.css';

const INSTRUCTIONS = [
  '- Говорите естественно, как в обычной беседе — это не опрос)',
  '- Старайтесь говорить чётко и спокойно.',
  '- Можно отвечать коротко или подробнее — как вам удобно.',
  '- Диалог займёт около минуты и поможет придумать напиток для вас!'
];

export default function AIInstructionScreen() {
  const navigate = useNavigate();

  const unlockAutoplay = () => {
    try {
      sessionStorage.setItem('ai-cha-audio-unlocked', 'true');
    } catch {
      // ignore storage errors
    }
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.stop(0.01);
      void ctx.resume().catch(() => {});
    } catch {
      // ignore unlock errors
    }
  };

  const handleStart = () => {
    try {
      sessionStorage.setItem('ai-cha-mode', 'ai');
    } catch {
      // ignore storage errors
    }
    unlockAutoplay();
    navigate('/ai-dialog');
  };

  const handleBack = () => {
    navigate('/mode');
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.centeredAnimation}>
            <div className={styles.animation}>
              <Lottie animationData={instructionLottie} loop autoplay className={styles.lottie} />
            </div>
          </div>
          <h1 className={styles.title}>Небольшая инструкция</h1>
          <p className={styles.subtitle}>
            Сейчас мы проведём короткий диалог, чтобы придумать напиток под ваше настроение и вкусы!
          </p>
          <ul className={styles.list}>
            {INSTRUCTIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className={styles.buttonRow}>
            <Button size="large" className={styles.startButton} onClick={handleStart}>
              Начать
            </Button>
            <button type="button" className={styles.backLink} onClick={handleBack}>
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
