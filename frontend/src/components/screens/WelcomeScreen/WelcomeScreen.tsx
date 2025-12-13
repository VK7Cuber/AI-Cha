import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTO_REDIRECT_MS = 10000;

function WelcomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/mode'), AUTO_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleStart = () => navigate('/mode');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 via-white to-white text-center text-[#212121]">
      <div className="mb-6 text-5xl font-bold text-[#D32F2F]">AI-Cha</div>
      <div className="space-y-2 text-3xl font-semibold">
        <div>Добро пожаловать в AI Cha!</div>
        <div className="text-2xl text-[#757575]">欢迎来到爱茶!</div>
      </div>
      <button
        type="button"
        onClick={handleStart}
        className="mt-10 rounded-full bg-[#D32F2F] px-8 py-4 text-2xl font-semibold text-white shadow-lg transition hover:scale-105 active:scale-95"
      >
        Нажмите, чтобы начать
      </button>
    </div>
  );
}

export default WelcomeScreen;

