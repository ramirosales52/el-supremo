import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function GoToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver al inicio"
      className={`fixed bottom-24 right-[1.625rem] z-50 flex size-11 items-center justify-center rounded-full bg-neutral-800 shadow-lg transition-all hover:scale-110 active:scale-95 border border-neutral-700 cursor-pointer ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <ArrowUp className="size-5 text-white" />
    </button>
  );
}
