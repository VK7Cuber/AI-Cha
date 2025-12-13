import Lottie, { Options } from 'lottie-react';

interface LottiePlayerProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottiePlayer({ animationData, loop = true, autoplay = true, className }: LottiePlayerProps) {
  const options: Options = {
    animationData,
    loop,
    autoplay
  };

  return <Lottie animationData={options.animationData} loop={options.loop} autoplay={options.autoplay} className={className} />;
}

export default LottiePlayer;

