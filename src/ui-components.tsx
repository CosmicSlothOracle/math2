
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

// --- Typography & Layout ---

export const SectionHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-4 sm:mb-6 ${className}`}>
    {children}
  </h2>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-black uppercase italic leading-tight ${className}`}>
    {children}
  </h3>
);

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; isInteractive?: boolean }> = ({
  children, className = '', onClick, isInteractive = false
}) => (
  <div
    onClick={onClick}
    className={`
      relative p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 backdrop-blur-xl transition-all duration-300
      ${isInteractive ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] touch-manipulation' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// --- Interactive Elements ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', isLoading, icon, className = '', disabled, ...props
}) => {
  const baseStyles = "relative font-black uppercase tracking-widest rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300";

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl hover:shadow-indigo-500/30 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-slate-200",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl border-b-4 border-emerald-800",
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
  };

  const sizes = {
    sm: "px-4 py-2.5 text-[10px] sm:text-xs min-h-[44px]",
    md: "px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm min-h-[44px]", // Minimum touch target
    lg: "px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base min-h-[56px]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'; className?: string }> = ({
  children, color = 'slate', className = ''
}) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-100 text-slate-500 border-slate-200"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export const DifficultyStars: React.FC<{ difficulty: 'Einfach' | 'Mittel' | 'Schwer' }> = ({ difficulty }) => {
  const count = difficulty === 'Einfach' ? 1 : difficulty === 'Mittel' ? 2 : 3;
  const color = difficulty === 'Einfach' ? 'text-emerald-400' : difficulty === 'Mittel' ? 'text-amber-400' : 'text-rose-500';

  return (
    <div className="flex gap-0.5" aria-label={`Schwierigkeit: ${difficulty}`}>
      {[1, 2, 3].map(i => (
        <span key={i} className={`text-xs sm:text-sm ${i <= count ? color : 'text-slate-200'}`}>★</span>
      ))}
    </div>
  );
};

// --- Feedback ---

export const ToastContainer: React.FC<{ toasts: { id: string; type: 'success' | 'error' | 'info'; message: string }[] }> = ({ toasts }) => (
  <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4" aria-live="polite">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`
          pointer-events-auto p-4 rounded-2xl shadow-2xl border-l-4 flex items-center gap-3 animate-in slide-in-from-bottom fade-in duration-300
          ${t.type === 'success' ? 'bg-white border-emerald-500 text-slate-800' :
            t.type === 'error' ? 'bg-white border-rose-500 text-slate-800' :
            'bg-slate-900 border-indigo-500 text-white'}
        `}
      >
        <span className="text-xl">{t.type === 'success' ? '🎉' : t.type === 'error' ? '⚠️' : 'ℹ️'}</span>
        <span className="font-bold text-xs sm:text-sm">{t.message}</span>
      </div>
    ))}
  </div>
);

export const CoinFlightAnimation: React.FC<{ isActive: boolean; onComplete: () => void }> = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (isActive) {
      // Spawn particles
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: Math.random() * 40 - 20, // Spread around center
        y: Math.random() * 40 - 20
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center">
      {particles.map((p, i) => (
        <div
          key={p.id}
          className="absolute text-2xl transition-all duration-1000 ease-in-out"
          style={{
            transform: `translate(${p.x}px, ${p.y}px)`, // Start position
            animation: `flyToCorner 1s forwards ${i * 0.05}s`
          }}
        >
          <div className="animate-spin text-amber-400 drop-shadow-lg">🪙</div>
        </div>
      ))}
      <style>{`
        @keyframes flyToCorner {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          20% {
             transform: translate(0, -50px) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translate(40vw, -45vh) scale(0.5); /* Target top right roughly */
          }
        }
      `}</style>
    </div>
  );
};

// --- Loading ---

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200/50 animate-pulse rounded-xl ${className}`} />
);

export const ProgressBar: React.FC<{ progress: number; color?: 'indigo' | 'emerald' | 'amber'; className?: string; label?: string }> = ({
  progress, color = 'indigo', className = '', label
}) => {
  const colors = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500"
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
};

// --- Layout ---

export const ModalOverlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic focus trap or just focus management
    overlayRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        ref={overlayRef}
        className="relative z-10 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar outline-none"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

// --- Tools ---

export const CalculatorWidget: React.FC<{ onClose: () => void; skin?: string }> = ({ onClose, skin = 'default' }) => {
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');

  // Mobile-first sizing with responsive detection
  const getInitialState = () => {
    if (typeof window === 'undefined') return { isMobile: false, x: 20, y: 80, w: 320, h: 480 };
    const mobile = window.innerWidth < 640;
    return {
      isMobile: mobile,
      x: mobile ? 10 : 20,
      y: mobile ? 60 : 80,
      w: mobile ? Math.min(320, window.innerWidth - 20) : 320,
      h: mobile ? 420 : 480
    };
  };

  const initialState = getInitialState();
  const [isMobile, setIsMobile] = useState(initialState.isMobile);
  const [position, setPosition] = useState({ x: initialState.x, y: initialState.y });
  const [size, setSize] = useState({ w: initialState.w, h: initialState.h });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      // Adjust size on mobile
      if (mobile && size.w > window.innerWidth - 20) {
        setSize({ w: Math.min(320, window.innerWidth - 20), h: 420 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size.w]);

  const [interaction, setInteraction] = useState<'idle' | 'dragging' | 'resizing'>('idle');
  const interactionStartRef = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0 });

  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 300;
  const MAX_WIDTH = typeof window !== 'undefined' ? Math.min(340, window.innerWidth - 20) : 320;
  const MAX_HEIGHT = 500;

  const startInteraction = (
    e: React.MouseEvent | React.TouchEvent,
    type: 'dragging' | 'resizing'
  ) => {
    e.stopPropagation();
    const point = 'touches' in e ? e.touches[0] : e;
    if ((type === 'dragging' && (e.target as HTMLElement).closest('button'))) return;

    setInteraction(type);
    interactionStartRef.current = {
      x: point.clientX,
      y: point.clientY,
      w: size.w,
      h: size.h,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    if (interaction === 'idle') return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e ? e.touches[0] : e;
      if (!point) return;
      const start = interactionStartRef.current;
      const deltaX = point.clientX - start.x;
      const deltaY = point.clientY - start.y;

      if (interaction === 'dragging') {
        const newX = start.posX + deltaX;
        const newY = start.posY + deltaY;
        const maxX = window.innerWidth - size.w;
        const maxY = window.innerHeight - size.h;
        setPosition({
            x: Math.max(0, Math.min(maxX, newX)),
            y: Math.max(0, Math.min(maxY, newY))
        });
      } else if (interaction === 'resizing') {
        const newW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, start.w + deltaX));
        const newH = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, start.h + deltaY));
        setSize({ w: newW, h: newH });
      }
    };

    const handleEnd = () => {
      setInteraction('idle');
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [interaction, size.w, size.h]);

  const handleInput = (val: string) => {
    if (result && !isNaN(Number(val)) && !isNaN(Number(display))) {
       setDisplay(val);
       setResult('');
    } else if (result) {
       setDisplay(result + val);
       setResult('');
    } else {
       setDisplay(prev => prev + val);
    }
  };

  const clear = () => {
    setDisplay('');
    setResult('');
  };

  const backspace = () => {
    setDisplay(prev => prev.slice(0, -1));
  };

  const deleteDisplay = () => {
    setDisplay('');
    // Behalte Result für weitere Berechnungen
  };

  const calculate = () => {
    try {
      let expression = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/²/g, '**2')
        .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)')
        .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/%/g, '/100');

      if (!expression.trim() || /[^0-9+\-*/().\sMathsqrt*]/.test(expression.replace(/Math.sqrt/g, ''))) {
         throw new Error("Invalid");
      }

      // eslint-disable-next-line no-new-func
      const res = new Function(`return ${expression}`)();
      let formatted = parseFloat(res.toFixed(8)).toString();
      setResult(formatted);
    } catch (e) {
      setResult('Error');
    }
  };

  const styles = useMemo(() => {
    switch (skin) {
      case 'neon': return {
        container: 'bg-black/95 border-green-400 shadow-[0_0_50px_rgba(34,197,94,0.4)] backdrop-blur-sm',
        header: 'bg-black/60 border-green-700/50 text-green-400 font-mono',
        display: 'bg-black/80 text-green-300 font-mono tracking-widest border-green-700/50 backdrop-blur-sm',
        displayLabel: 'text-green-600',
        btn: 'bg-black/70 border-green-700/40 text-green-400 hover:bg-green-900/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] font-mono transition-all duration-200 hover:scale-105',
        btnPrimary: 'bg-gradient-to-r from-green-600 to-green-500 text-black border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:from-green-500 hover:to-green-400',
        btnDanger: 'bg-green-900/30 text-green-400 border-green-800/50 hover:text-green-300 hover:bg-green-900/50 backdrop-blur-sm',
        title: 'NEON OS v9.0'
      };
      case 'chaos': return {
        container: 'bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 border-pink-400 shadow-[0_0_40px_rgba(236,72,153,0.5)] backdrop-blur-sm',
        header: 'bg-purple-800/60 border-pink-500/40 text-pink-300 font-bold',
        display: 'bg-purple-950/80 text-pink-200 border-pink-500/40 backdrop-blur-sm font-bold',
        displayLabel: 'text-pink-600',
        btn: 'bg-gradient-to-br from-purple-700 to-pink-700 border-purple-500 text-pink-200 hover:from-pink-600 hover:to-purple-600 hover:text-white hover:rotate-6 hover:scale-110 transition-all duration-300 font-bold shadow-lg',
        btnPrimary: 'bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:shadow-[0_0_35px_rgba(236,72,153,0.8)] hover:scale-105',
        btnDanger: 'bg-gradient-to-r from-red-800 to-pink-800 text-red-200 border-red-600 hover:from-red-700 hover:to-pink-700',
        title: 'CHaOs CaLc 🔥✨'
      };
      case 'soup': return {
        container: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
        header: 'bg-gradient-to-r from-amber-200 to-orange-200 border-amber-300 text-amber-900 font-serif italic',
        display: 'bg-gradient-to-br from-white to-amber-50 border-amber-300 text-amber-900 font-serif shadow-inner',
        displayLabel: 'text-amber-500',
        btn: 'bg-gradient-to-br from-white to-amber-50 border-amber-300 text-amber-800 hover:from-amber-50 hover:to-amber-100 font-serif font-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105',
        btnPrimary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-orange-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]',
        btnDanger: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 border-rose-300 hover:from-rose-200 hover:to-pink-200',
        title: 'Alphabet Soup 🍲'
      };
      case 'quantum': return {
        container: 'bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.4)] backdrop-blur-sm',
        header: 'bg-black/30 border-cyan-500/50 text-cyan-300 font-mono',
        display: 'bg-black/40 border-cyan-400/30 text-cyan-100 font-mono tracking-wider backdrop-blur-sm',
        displayLabel: 'text-cyan-500',
        btn: 'bg-slate-800/50 border-cyan-600/30 text-cyan-200 hover:bg-cyan-800/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] font-mono backdrop-blur-sm transition-all duration-300 hover:scale-105',
        btnPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:from-cyan-400 hover:to-blue-400',
        btnDanger: 'bg-red-900/50 text-red-300 border-red-700/50 hover:bg-red-800/50 backdrop-blur-sm',
        title: 'Quantum Matrix ⚛️'
      };
      default: return {
        container: 'bg-white/95 border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl',
        header: 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300 text-slate-600',
        display: 'bg-gradient-to-br from-slate-50 to-white border-slate-200 text-slate-800 shadow-inner',
        displayLabel: 'text-slate-500',
        btn: 'bg-gradient-to-br from-slate-50 to-white border-slate-200 text-slate-700 hover:from-slate-100 hover:to-slate-50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105',
        btnPrimary: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:from-indigo-500 hover:to-blue-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]',
        btnDanger: 'bg-gradient-to-r from-rose-100 to-pink-100 border-rose-200 text-rose-600 hover:from-rose-200 hover:to-pink-200',
        title: 'TASCHENRECHNER'
      };
    }
  }, [skin]);

  const scaleFactor = useMemo(() => size.w / MAX_WIDTH, [size.w]);

  const dynamicStyles = useMemo(() => ({
    headerIconSize: `${Math.max(1.1, 1.5 * scaleFactor)}rem`,
    headerTitleSize: `${Math.max(0.6, 0.75 * scaleFactor)}rem`,
    displayLabelSize: `${Math.max(0.6, 0.875 * scaleFactor)}rem`,
    displayResultSize: `${Math.max(1.2, 1.875 * scaleFactor)}rem`,
    buttonFontSize: `${Math.max(0.7, 1.125 * scaleFactor)}rem`,
    gridGap: `${Math.max(4, 8 * scaleFactor)}px`,
    padding: `${Math.max(8, 16 * scaleFactor)}px`,
  }), [scaleFactor]);

  const getLabel = (l: string) => {
    if (skin === 'chaos') {
      if (l === '×') return '🔥'; if (l === '÷') return '🧊'; if (l === '+') return '🪜';
      if (l === '-') return '🕳️'; if (l === 'C') return '💥';
    }
    if (skin === 'soup') {
      if (l === '×') return '🤝'; if (l === '÷') return '💔'; if (l === '+') return '➕'; if (l === '-') return '➖';
      const map: Record<string, string> = {'1':'A','2':'B','3':'C','4':'D','5':'E','6':'F','7':'G','8':'H','9':'I','0':'Z'};
      if (map[l]) return map[l];
    }
    return l;
  };

  const rotations = useMemo(() => {
    const r: { [key: string]: number } = {};
    const labels = ['÷', '(', ')', '%', '×', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '0', '.', 'x²'];
    labels.forEach(l => {
        r[l] = skin === 'chaos' ? Math.random() * 6 - 3 : 0;
    });
    return r;
  }, [skin]);

  const renderBtn = ({ l, v, c, isPrimary, isDanger }: { l: string, v?: string, c?: string, isPrimary?: boolean, isDanger?: boolean }) => {
    const rotation = rotations[l] || 0;
    return (
      <button
        key={l}
        onClick={() => v ? handleInput(v) : undefined}
        style={{ transform: `rotate(${rotation}deg)`, fontSize: dynamicStyles.buttonFontSize }}
        title={v || l}
        className={`h-full w-full rounded-xl font-bold active:scale-95 transition-all shadow-sm border flex items-center justify-center min-h-[44px] touch-manipulation ${isPrimary ? styles.btnPrimary : isDanger ? styles.btnDanger : styles.btn} ${c || ''}`}
      >
        {getLabel(l)}
      </button>
    );
  };

  return (
    <div
      style={{ left: position.x, top: position.y, width: size.w, height: size.h }}
      className={`fixed z-[160] rounded-[2rem] overflow-hidden border animate-in zoom-in-95 duration-200 flex flex-col ${styles.container}`}
    >
      <div
        onMouseDown={e => startInteraction(e, 'dragging')}
        onTouchStart={e => startInteraction(e, 'dragging')}
        style={{ padding: dynamicStyles.padding }}
        className={`flex justify-between items-center cursor-move select-none border-b shrink-0 ${styles.header}`}
      >
        <div className="flex items-center gap-2 pointer-events-none">
           <span style={{ fontSize: dynamicStyles.headerIconSize }}>{skin === 'neon' ? '📟' : skin === 'chaos' ? '🤪' : skin === 'soup' ? '🍲' : skin === 'quantum' ? '⚛️' : '🧮'}</span>
           <span className="font-black uppercase tracking-widest" style={{ fontSize: dynamicStyles.headerTitleSize }}>{styles.title}</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-black/10 rounded-full hover:bg-rose-500 hover:text-white transition-colors">✕</button>
      </div>

      <div style={{ padding: dynamicStyles.padding }} className={`text-right border-b shrink-0 ${styles.display}`}>
         <div className="h-6 font-medium overflow-hidden whitespace-nowrap flex items-center justify-end" style={{ fontSize: dynamicStyles.displayLabelSize }}>{display || '0'}</div>
         <div className="h-10 font-black overflow-hidden whitespace-nowrap flex items-center justify-end" style={{ fontSize: dynamicStyles.displayResultSize }}>{result || (display ? '=' : '')}</div>
      </div>

      <div style={{ padding: dynamicStyles.padding, gap: dynamicStyles.gridGap }} className={`grid grid-cols-4 flex-1 h-full min-h-0 touch-manipulation`}>
         <button style={{fontSize: `calc(${dynamicStyles.buttonFontSize} * 0.75)`}} onClick={clear} className={`h-full rounded-xl font-black uppercase tracking-widest border ${styles.btnDanger}`}>Clear</button>
         <button style={{fontSize: `calc(${dynamicStyles.buttonFontSize} * 0.75)`}} onClick={deleteDisplay} className={`h-full rounded-xl font-black uppercase tracking-widest border ${styles.btnDanger}`} title="Delete Input (Keep Result)">Del</button>
         <button style={{fontSize: dynamicStyles.buttonFontSize}} onClick={backspace} className={`h-full rounded-xl font-bold border ${styles.btn}`}>⌫</button>
         {renderBtn({ l: "÷", v: "÷" })}
         {renderBtn({ l: "(", v: "(" })}
         {renderBtn({ l: ")", v: ")" })}
         {renderBtn({ l: "%", v: "%" })}
         {renderBtn({ l: "×", v: "×" })}
         {renderBtn({ l: "7", v: "7" })}
         {renderBtn({ l: "8", v: "8" })}
         {renderBtn({ l: "9", v: "9" })}
         {renderBtn({ l: "-", v: "-" })}
         {renderBtn({ l: "4", v: "4" })}
         {renderBtn({ l: "5", v: "5" })}
         {renderBtn({ l: "6", v: "6" })}
         {renderBtn({ l: "+", v: "+" })}
         {renderBtn({ l: "1", v: "1" })}
         {renderBtn({ l: "2", v: "2" })}
         {renderBtn({ l: "3", v: "3" })}
         <button
            onClick={() => calculate()}
            style={{fontSize: `calc(${dynamicStyles.buttonFontSize} * 1.2)`}}
            className={`row-span-2 h-full rounded-xl font-black shadow-lg active:translate-y-1 ${styles.btnPrimary}`}
         >
           =
         </button>
         {renderBtn({ l: "0", v: "0" })}
         {renderBtn({ l: ".", v: "." })}
         {renderBtn({ l: "x²", v: "²" })}
      </div>

      <div
        onMouseDown={(e) => startInteraction(e, 'resizing')}
        onTouchStart={(e) => startInteraction(e, 'resizing')}
        className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-50 flex items-end justify-end p-1 opacity-50 hover:opacity-100 touch-none"
      >
        <svg viewBox="0 0 10 10" className="w-4 h-4 text-current pointer-events-none">
           <path d="M 10,10 L 10,0 L 0,10 Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

// --- Interaction ---

export const PullToRefresh: React.FC<{ onRefresh: () => Promise<void>, children: React.ReactNode, className?: string }> = ({ onRefresh, children, className = '' }) => {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0 && !loading) {
      const y = e.touches[0].clientY;
      const dist = Math.max(0, y - startY);
      setPullDistance(dist);
      if (dist > 60) setPulling(true);
      else setPulling(false);
    }
  };

  const handleTouchEnd = async () => {
    if (pulling) {
      setLoading(true);
      setPulling(false);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setLoading(false);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto custom-scrollbar relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pullDistance > 0 || loading) && (
        <div
          className="absolute left-0 right-0 flex justify-center z-20 pointer-events-none transition-all duration-200"
          style={{ top: loading ? '10px' : Math.min(pullDistance / 2, 40) + 'px', opacity: Math.min(pullDistance / 50, 1) }}
        >
             <div className="bg-white/90 backdrop-blur-md text-indigo-600 rounded-full px-4 py-1.5 shadow-lg border border-indigo-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                {loading ? (
                  <><span className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"/> Aktualisiere...</>
                ) : (
                  <><span className={`transition-transform duration-200 ${pulling ? 'rotate-180' : ''}`}>↓</span> Loslassen zum Laden</>
                )}
             </div>
        </div>
      )}
      {children}
    </div>
  )
};
