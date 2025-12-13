import clsx from 'clsx';

interface LoadingProps {
  fullscreen?: boolean;
  text?: string;
}

export function Loading({ fullscreen, text = 'Загрузка...' }: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <div className="text-button font-semibold text-primary">{text}</div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80">
        {spinner}
      </div>
    );
  }

  return <div className={clsx('py-6 text-center')}>{spinner}</div>;
}

export default Loading;

